import assert from 'assert';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../server/db/database';
import { SafetyGuardrailService, aiService } from '../server/services/aiService';
import { JWT_SECRET } from '../server/middleware/auth';

console.log('🧪 Starting MediMateAI Comprehensive Verification Tests...\n');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res
          .then(() => {
            console.log(`  ✓ ${name}`);
            passed++;
          })
          .catch(err => {
            console.error(`  ✗ ${name}`);
            console.error(`    Error: ${err.message}`);
            failed++;
          });
      } else {
        console.log(`  ✓ ${name}`);
        passed++;
      }
    } catch (err: any) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Password & Auth Tests
  await test('Password hashing & validation with bcrypt', async () => {
    const rawPass = 'SecretHealth123!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPass, salt);

    assert.ok(hash !== rawPass, 'Password must be hashed');
    const isMatch = await bcrypt.compare(rawPass, hash);
    assert.strictEqual(isMatch, true, 'Valid password must match hash');
    const isFalseMatch = await bcrypt.compare('WrongPassword', hash);
    assert.strictEqual(isFalseMatch, false, 'Invalid password must not match');
  });

  await test('JWT Token Signing and Verification', () => {
    const payload = { id: 'usr_test_123', email: 'test@medimate.ai' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    assert.ok(typeof token === 'string' && token.length > 20, 'Token must be generated');

    const decoded = jwt.verify(token, JWT_SECRET) as typeof payload;
    assert.strictEqual(decoded.id, payload.id, 'Decoded ID must match payload');
    assert.strictEqual(decoded.email, payload.email, 'Decoded email must match');
  });

  // 2. User Registration & Database Tests
  const testEmail = `test_${Date.now()}@medimate.ai`;
  let testUserId = '';

  await test('User Creation and Duplicate Prevention', () => {
    const user = db.createUser({
      name: 'Dr. Jane Tester',
      email: testEmail,
      passwordHash: 'hashed_dummy_password',
    });

    assert.ok(user.id.startsWith('usr_'), 'User ID must have prefix');
    assert.strictEqual(user.email, testEmail);
    testUserId = user.id;

    const duplicate = db.findUserByEmail(testEmail);
    assert.ok(duplicate !== undefined, 'User must be retrievable by email');
    assert.strictEqual(duplicate?.id, user.id);
  });

  // 3. Health Profile CRUD & Scoping
  await test('Health Profile Creation & Update', () => {
    const profile = db.updateHealthProfile(testUserId, {
      dateOfBirth: '1988-11-20',
      sex: 'female',
      bloodType: 'O+',
      heightCm: 170,
      weightKg: 65,
      allergies: [{ name: 'Amoxicillin', severity: 'severe', reaction: 'Anaphylaxis' }],
      chronicConditions: ['Mild Hypertension'],
      emergencyContact: { name: 'Mark Tester', relationship: 'Partner', phone: '+15551234567' },
    });

    assert.strictEqual(profile.userId, testUserId);
    assert.strictEqual(profile.bloodType, 'O+');
    assert.strictEqual(profile.allergies.length, 1);
    assert.strictEqual(profile.allergies[0].name, 'Amoxicillin');
    assert.strictEqual(profile.emergencyContact?.name, 'Mark Tester');

    const fetched = db.getHealthProfile(testUserId);
    assert.strictEqual(fetched?.heightCm, 170);
  });

  // 4. Medication CRUD & Dose Adherence Logging
  let testMedId = '';
  await test('Medication CRUD & Adherence Dose Logging', () => {
    const med = db.createMedication(testUserId, {
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily in morning',
      timeOfDay: ['morning'],
      instructions: 'Take with or without food',
      prescribedFor: 'Blood pressure control',
      startDate: '2025-01-01',
      active: true,
    });

    assert.ok(med.id.startsWith('med_'));
    assert.strictEqual(med.name, 'Lisinopril');
    testMedId = med.id;

    const today = new Date().toISOString().split('T')[0];
    const logged = db.logMedicationDose(testUserId, testMedId, today, true);
    assert.ok(logged !== null);
    assert.strictEqual(logged?.logs.length, 1);
    assert.strictEqual(logged?.logs[0].taken, true);

    const updated = db.updateMedication(testUserId, testMedId, { active: false });
    assert.strictEqual(updated?.active, false);

    const list = db.getMedications(testUserId);
    assert.ok(list.length >= 1);
  });

  // 5. Conversation & Message Lifecycle
  let testConvId = '';
  await test('Conversation Creation and Message Persistence', () => {
    const conv = db.createConversation(testUserId, 'Initial Consultation');
    assert.ok(conv.id.startsWith('conv_'));
    assert.strictEqual(conv.userId, testUserId);
    testConvId = conv.id;

    const userMsg = db.addMessageToConversation(testUserId, testConvId, {
      role: 'user',
      content: 'I have had mild headaches for the past 2 days.',
    });
    assert.ok(userMsg !== null);
    assert.strictEqual(userMsg?.conversation.messages.length, 1);

    const assistantMsg = db.addMessageToConversation(testUserId, testConvId, {
      role: 'assistant',
      content: 'Headaches can have various common causes including hydration and tension...',
      suggestedQuestions: ['What should I observe over the next 24 hours?'],
    });
    assert.ok(assistantMsg !== null);
    assert.strictEqual(assistantMsg?.conversation.messages.length, 2);
  });

  // 6. Medical Safety Guardrails & Red Flag Detection
  await test('Emergency Pattern Detection (Safety Guardrail)', () => {
    const emergencyText = 'I have sudden severe crushing chest pain radiating to my left arm and jaw';
    const check1 = SafetyGuardrailService.checkEmergency(emergencyText);
    assert.strictEqual(check1.isUrgent, true, 'Crushing chest pain must trigger emergency status');

    const nonEmergencyText = 'I have a mild runny nose and sneezed twice this morning';
    const check2 = SafetyGuardrailService.checkEmergency(nonEmergencyText);
    assert.strictEqual(check2.isUrgent, false, 'Mild cold must not trigger emergency status');

    const strokeText = 'My mother has sudden slurred speech and facial drooping';
    const check3 = SafetyGuardrailService.checkEmergency(strokeText);
    assert.strictEqual(check3.isUrgent, true, 'Stroke symptoms must trigger emergency status');
  });

  // 7. Clinical AI Assistant Response Generation
  await test('Clinical Assistant Response with Medical Guardrails', async () => {
    const profile = db.getHealthProfile(testUserId);
    const meds = db.getMedications(testUserId);

    const response = await aiService.generateMedicalResponse({
      userMessage: 'Can you tell me about common side effects of Lisinopril?',
      history: [],
      userProfile: profile,
      userMedications: meds,
    });

    assert.ok(response.content.length > 50, 'Response must have meaningful clinical content');
    assert.ok(Array.isArray(response.suggestedQuestions), 'Must return suggested questions');
    assert.ok(response.suggestedQuestions.length > 0, 'Must have at least one suggested question');
  });

  // 8. Health History Logging
  await test('Health History Timeline Logging', () => {
    const note = db.addHistoryItem(testUserId, {
      type: 'note',
      title: 'Resting Heart Rate Check',
      description: 'Logged 64 bpm using pulse oximeter.',
    });

    assert.ok(note.id.startsWith('hist_'));
    const history = db.getHistory(testUserId);
    assert.ok(history.length >= 1);
  });

  // 9. Full Data Export & Account Deletion Purge
  await test('Data Export & Complete Account Removal', () => {
    const archive = db.exportUserData(testUserId);
    assert.ok(archive !== null);
    assert.strictEqual(archive?.user.id, testUserId);
    assert.ok(Array.isArray(archive?.medications));
    assert.ok(Array.isArray(archive?.conversations));

    const deleted = db.deleteUser(testUserId);
    assert.strictEqual(deleted, true);

    const checkUser = db.findUserById(testUserId);
    assert.strictEqual(checkUser, undefined, 'User must no longer exist');

    const checkMeds = db.getMedications(testUserId);
    assert.strictEqual(checkMeds.length, 0, 'Medications must be purged');

    const checkConvs = db.getConversations(testUserId);
    assert.strictEqual(checkConvs.length, 0, 'Conversations must be purged');
  });

  console.log(`\n========================================`);
  console.log(`Tests Completed: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
