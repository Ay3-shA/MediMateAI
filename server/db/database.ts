import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface UserDoc {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface HealthProfileDoc {
  id: string;
  userId: string;
  dateOfBirth?: string;
  sex?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
  heightCm?: number;
  weightKg?: number;
  allergies: { name: string; severity: 'mild' | 'moderate' | 'severe'; reaction?: string }[];
  chronicConditions: string[];
  medicalHistory?: string;
  familyHistory?: string;
  emergencyContact?: { name: string; relationship: string; phone: string };
  updatedAt: string;
}

export interface MedicationDoc {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: ('morning' | 'afternoon' | 'evening' | 'bedtime')[];
  instructions?: string;
  prescribedFor?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  notes?: string;
  logs: { date: string; taken: boolean; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageDoc {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isUrgent?: boolean;
  suggestedQuestions?: string[];
}

export interface ConversationDoc {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessageDoc[];
  createdAt: string;
  updatedAt: string;
}

export interface HealthHistoryDoc {
  id: string;
  userId: string;
  type: 'consultation' | 'medication' | 'profile' | 'note';
  title: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

interface DatabaseSchema {
  users: UserDoc[];
  healthProfiles: HealthProfileDoc[];
  medications: MedicationDoc[];
  conversations: ConversationDoc[];
  history: HealthHistoryDoc[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'medimate_db.json');

class DatabaseStorage {
  private data: DatabaseSchema = {
    users: [],
    healthProfiles: [],
    medications: [],
    conversations: [],
    history: [],
  };
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;

    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create data directory:', err);
      }
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure all arrays exist
        this.data.users = this.data.users || [];
        this.data.healthProfiles = this.data.healthProfiles || [];
        this.data.medications = this.data.medications || [];
        this.data.conversations = this.data.conversations || [];
        this.data.history = this.data.history || [];
      } catch (err) {
        console.error('Failed reading DB file, seeding fresh:', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }

    this.isInitialized = true;
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  private seedInitialData() {
    const demoUserId = 'usr_demo_101';
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('DemoUser123!', salt);

    const demoUser: UserDoc = {
      id: demoUserId,
      name: 'Sarah Jenkins',
      email: 'demo@medimate.ai',
      passwordHash: demoPasswordHash,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    };

    const demoProfile: HealthProfileDoc = {
      id: 'prof_demo_101',
      userId: demoUserId,
      dateOfBirth: '1992-06-15',
      sex: 'female',
      bloodType: 'A+',
      heightCm: 168,
      weightKg: 64,
      allergies: [
        { name: 'Penicillin', severity: 'moderate', reaction: 'Mild hives and skin rash' },
        { name: 'Tree nuts', severity: 'mild', reaction: 'Oral tingling sensation' },
      ],
      chronicConditions: ['Mild Seasonal Asthma', 'Occasional Tension Headaches'],
      medicalHistory: 'Appendectomy in 2014. No major chronic cardiovascular issues. Regular aerobic runner.',
      familyHistory: 'Maternal history of hypertension. Paternal history of Type 2 diabetes.',
      emergencyContact: {
        name: 'David Jenkins',
        relationship: 'Spouse',
        phone: '+1 (555) 234-8901',
      },
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const demoMedications: MedicationDoc[] = [
      {
        id: 'med_101',
        userId: demoUserId,
        name: 'Albuterol HFA Inhaler',
        dosage: '90 mcg / 2 puffs',
        frequency: 'As needed for acute wheezing / exercise',
        timeOfDay: ['morning', 'afternoon'],
        instructions: 'Rinse mouth with water after use. Shake well before puffing.',
        prescribedFor: 'Exercise-induced bronchospasm',
        startDate: '2025-01-10',
        active: true,
        notes: 'Keep with gym bag during running sessions.',
        logs: [
          { date: yesterdayStr, taken: true, timestamp: new Date(Date.now() - 86400000).toISOString() },
          { date: todayStr, taken: true, timestamp: new Date().toISOString() },
        ],
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'med_102',
        userId: demoUserId,
        name: 'Vitamin D3 (Cholecalciferol)',
        dosage: '2000 IU (1 softgel)',
        frequency: 'Once daily with breakfast',
        timeOfDay: ['morning'],
        instructions: 'Take with a meal containing healthy dietary fats for optimal absorption.',
        prescribedFor: 'Vitamin D deficiency maintenance',
        startDate: '2025-02-01',
        active: true,
        notes: 'Check serum 25-hydroxyvitamin D levels in 6 months.',
        logs: [
          { date: todayStr, taken: true, timestamp: new Date().toISOString() },
        ],
        createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'med_103',
        userId: demoUserId,
        name: 'Cetirizine (Zyrtec)',
        dosage: '10 mg tablet',
        frequency: 'Once daily at bedtime as needed',
        timeOfDay: ['bedtime'],
        instructions: 'Non-drowsy antihistamine for spring seasonal pollen flare-ups.',
        prescribedFor: 'Seasonal allergic rhinitis',
        startDate: '2025-03-01',
        active: false,
        notes: 'Paused for summer season; resume if pollen count rises.',
        logs: [],
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      }
    ];

    const demoConversation: ConversationDoc = {
      id: 'conv_101',
      userId: demoUserId,
      title: 'Persistent Cough & Post-Exercise Tightness',
      messages: [
        {
          id: 'msg_1',
          role: 'user',
          content: 'Hi MediMate, I have had a dry cough for the past 4 days, especially noticeable right after my morning jogs. I do have mild asthma. Should I be concerned?',
          timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
        },
        {
          id: 'msg_2',
          role: 'assistant',
          content: `Hello Sarah. I'm here to help you understand your symptoms, though please remember this guidance is educational and does not replace a clinical examination.

Given your known history of mild asthma, a dry cough that flares after physical exertion in cool morning air is often consistent with **exercise-induced bronchospasm (EIB)** or mild airway irritation. 

### Key Aspects to Observe:
1. **Response to Inhaler**: Does taking your prescribed Albuterol 15 minutes before running prevent this cough, or does a puff ease the tightness when it starts?
2. **Associated Signs**: Are you experiencing fever, sore throat, or nasal congestion that might indicate a mild viral upper respiratory infection?
3. **Onset & Triggers**: Have there been recent temperature drops, elevated outdoor pollen, or humidity shifts along your jogging route?

### ⚠️ When to Seek Prompt Medical Attention:
If you experience any of the following, seek urgent medical evaluation or emergency care immediately:
* Shortness of breath at rest that does not rapidly respond to your rescue inhaler
* Struggling to speak in full sentences
* Chest pain, pressure, or blue tint around the lips/fingernails

### Suggested Questions for Your Physician:
* "Could we review my pre-exercise asthma action plan?"
* "Would a short-term controller inhaler be beneficial if morning cough persists?"`,
          timestamp: new Date(Date.now() - 36 * 3600000 + 4000).toISOString(),
          isUrgent: false,
          suggestedQuestions: [
            'How can I warm up my airways before cold weather running?',
            'What is the difference between asthma flare-up and bronchitis?',
            'What should I write down to monitor my peak flow?'
          ],
        },
        {
          id: 'msg_3',
          role: 'user',
          content: 'That makes a lot of sense. The weather has been around 45°F and dry. What questions should I write down for my checkup on Friday?',
          timestamp: new Date(Date.now() - 35 * 3600000).toISOString(),
        },
        {
          id: 'msg_4',
          role: 'assistant',
          content: `That cool, dry air (45°F) is a very well-documented trigger for airway constriction.

Here is a concise list of high-value questions you can take to your Friday appointment:

1. **Trigger Management**: *"My cough consistently triggers during outdoor runs in dry 45°F air. Should I adjust my Albuterol pre-treatment timing?"*
2. **Symptom Log**: *"I have noticed this for 4 days. Is this a mild seasonal exacerbation or a secondary viral infection?"*
3. **Inhaler Technique**: *"Could we quickly verify my spacer and inhalation technique to ensure maximal medication delivery?"*
4. **Action Plan Thresholds**: *"At what peak flow level or rescue puff frequency would you prefer I call the clinic?"*

In the meantime, consider wearing a light fabric neck gaiter loosely over your nose and mouth during runs to help warm and humidify the air you inhale.`,
          timestamp: new Date(Date.now() - 35 * 3600000 + 3000).toISOString(),
          isUrgent: false,
          suggestedQuestions: [
            'Does using a spacer really make a difference with inhalers?',
            'How does humidity impact asthma symptoms?'
          ],
        }
      ],
      createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 35 * 3600000).toISOString(),
    };

    const demoHistory: HealthHistoryDoc[] = [
      {
        id: 'hist_101',
        userId: demoUserId,
        type: 'consultation',
        title: 'Symptom Review: Exercise-Induced Cough',
        description: 'Discussed post-jog dry cough in 45°F weather and generated doctor appointment questions.',
        metadata: { conversationId: demoConversation.id },
        timestamp: new Date(Date.now() - 35 * 3600000).toISOString(),
      },
      {
        id: 'hist_102',
        userId: demoUserId,
        type: 'medication',
        title: 'Medication Adherence Recorded',
        description: 'Logged morning doses for Albuterol HFA and Vitamin D3.',
        metadata: { medicationName: 'Albuterol HFA Inhaler' },
        timestamp: new Date().toISOString(),
      },
      {
        id: 'hist_103',
        userId: demoUserId,
        type: 'profile',
        title: 'Health Profile Updated',
        description: 'Updated baseline weight (64 kg) and confirmed allergy list.',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'hist_104',
        userId: demoUserId,
        type: 'note',
        title: 'Blood Pressure Self-Check',
        description: 'Resting BP reading: 118/76 mmHg, pulse 62 bpm after 10 minutes of quiet sitting.',
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
      }
    ];

    this.data.users = [demoUser];
    this.data.healthProfiles = [demoProfile];
    this.data.medications = demoMedications;
    this.data.conversations = [demoConversation];
    this.data.history = demoHistory;

    this.save();
  }

  // --- Users ---
  findUserByEmail(email: string): UserDoc | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): UserDoc | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user: Omit<UserDoc, 'id' | 'createdAt'>): UserDoc {
    const newUser: UserDoc = {
      ...user,
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    
    // Auto-create blank health profile for user
    this.createHealthProfile({
      userId: newUser.id,
      allergies: [],
      chronicConditions: [],
      updatedAt: new Date().toISOString(),
    });

    this.save();
    return newUser;
  }

  updateUser(id: string, updates: Partial<Pick<UserDoc, 'name' | 'email' | 'passwordHash'>>): UserDoc | null {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates);
    this.save();
    return user;
  }

  deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.data.healthProfiles = this.data.healthProfiles.filter(p => p.userId !== id);
    this.data.medications = this.data.medications.filter(m => m.userId !== id);
    this.data.conversations = this.data.conversations.filter(c => c.userId !== id);
    this.data.history = this.data.history.filter(h => h.userId !== id);
    this.save();
    return this.data.users.length < initialLen;
  }

  // --- Health Profile ---
  getHealthProfile(userId: string): HealthProfileDoc | undefined {
    return this.data.healthProfiles.find(p => p.userId === userId);
  }

  createHealthProfile(profile: Omit<HealthProfileDoc, 'id'>): HealthProfileDoc {
    const newProfile: HealthProfileDoc = {
      ...profile,
      id: 'prof_' + Date.now(),
    };
    this.data.healthProfiles.push(newProfile);
    this.save();
    return newProfile;
  }

  updateHealthProfile(userId: string, updates: Partial<HealthProfileDoc>): HealthProfileDoc {
    let profile = this.getHealthProfile(userId);
    if (!profile) {
      profile = this.createHealthProfile({
        userId,
        allergies: [],
        chronicConditions: [],
        updatedAt: new Date().toISOString(),
        ...updates,
      });
      return profile;
    }

    Object.assign(profile, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return profile;
  }

  // --- Medications ---
  getMedications(userId: string): MedicationDoc[] {
    return this.data.medications
      .filter(m => m.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getMedicationById(userId: string, medId: string): MedicationDoc | undefined {
    return this.data.medications.find(m => m.userId === userId && m.id === medId);
  }

  createMedication(userId: string, medData: Omit<MedicationDoc, 'id' | 'userId' | 'logs' | 'createdAt' | 'updatedAt'>): MedicationDoc {
    const now = new Date().toISOString();
    const newMed: MedicationDoc = {
      ...medData,
      id: 'med_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      logs: [],
      createdAt: now,
      updatedAt: now,
    };
    this.data.medications.push(newMed);
    
    // Add to history
    this.addHistoryItem(userId, {
      type: 'medication',
      title: `Added Medication: ${newMed.name}`,
      description: `${newMed.dosage} - ${newMed.frequency}`,
      metadata: { medicationId: newMed.id },
    });

    this.save();
    return newMed;
  }

  updateMedication(userId: string, medId: string, updates: Partial<MedicationDoc>): MedicationDoc | null {
    const med = this.getMedicationById(userId, medId);
    if (!med) return null;
    
    Object.assign(med, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return med;
  }

  logMedicationDose(userId: string, medId: string, dateStr: string, taken: boolean): MedicationDoc | null {
    const med = this.getMedicationById(userId, medId);
    if (!med) return null;

    const existingLog = med.logs.find(l => l.date === dateStr);
    const now = new Date().toISOString();

    if (existingLog) {
      existingLog.taken = taken;
      existingLog.timestamp = now;
    } else {
      med.logs.push({ date: dateStr, taken, timestamp: now });
    }

    med.updatedAt = now;

    if (taken) {
      this.addHistoryItem(userId, {
        type: 'medication',
        title: `Took Medication: ${med.name}`,
        description: `Logged dosage (${med.dosage}) taken for ${dateStr}.`,
        metadata: { medicationId: med.id, date: dateStr },
      });
    }

    this.save();
    return med;
  }

  deleteMedication(userId: string, medId: string): boolean {
    const initialLen = this.data.medications.length;
    const med = this.getMedicationById(userId, medId);
    if (med) {
      this.data.medications = this.data.medications.filter(m => !(m.userId === userId && m.id === medId));
      this.addHistoryItem(userId, {
        type: 'medication',
        title: `Removed Medication: ${med.name}`,
        description: `Discontinued tracker for ${med.name}.`,
      });
      this.save();
      return true;
    }
    return false;
  }

  // --- Conversations ---
  getConversations(userId: string): ConversationDoc[] {
    return this.data.conversations
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getConversationById(userId: string, convId: string): ConversationDoc | undefined {
    return this.data.conversations.find(c => c.userId === userId && c.id === convId);
  }

  createConversation(userId: string, title = 'New Health Conversation'): ConversationDoc {
    const now = new Date().toISOString();
    const newConv: ConversationDoc = {
      id: 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      title,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    this.data.conversations.push(newConv);
    this.save();
    return newConv;
  }

  updateConversationTitle(userId: string, convId: string, title: string): ConversationDoc | null {
    const conv = this.getConversationById(userId, convId);
    if (!conv) return null;
    conv.title = title;
    conv.updatedAt = new Date().toISOString();
    this.save();
    return conv;
  }

  addMessageToConversation(
    userId: string, 
    convId: string, 
    message: Omit<ChatMessageDoc, 'id' | 'timestamp'>
  ): { conversation: ConversationDoc; message: ChatMessageDoc } | null {
    const conv = this.getConversationById(userId, convId);
    if (!conv) return null;

    const fullMessage: ChatMessageDoc = {
      ...message,
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
    };

    conv.messages.push(fullMessage);
    conv.updatedAt = fullMessage.timestamp;

    // Auto-update conversation title if it is still default and user sends first message
    if (conv.messages.length === 1 && message.role === 'user' && conv.title === 'New Health Conversation') {
      conv.title = message.content.slice(0, 45).trim() + (message.content.length > 45 ? '...' : '');
    }

    this.save();
    return { conversation: conv, message: fullMessage };
  }

  deleteConversation(userId: string, convId: string): boolean {
    const initialLen = this.data.conversations.length;
    this.data.conversations = this.data.conversations.filter(c => !(c.userId === userId && c.id === convId));
    this.save();
    return this.data.conversations.length < initialLen;
  }

  clearUserConversations(userId: string): number {
    const count = this.data.conversations.filter(c => c.userId === userId).length;
    this.data.conversations = this.data.conversations.filter(c => c.userId !== userId);
    this.save();
    return count;
  }

  // --- History ---
  getHistory(userId: string, type?: string): HealthHistoryDoc[] {
    let items = this.data.history.filter(h => h.userId === userId);
    if (type && type !== 'all') {
      items = items.filter(h => h.type === type);
    }
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addHistoryItem(userId: string, item: Omit<HealthHistoryDoc, 'id' | 'userId' | 'timestamp'>): HealthHistoryDoc {
    const newItem: HealthHistoryDoc = {
      ...item,
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      timestamp: new Date().toISOString(),
    };
    this.data.history.push(newItem);
    this.save();
    return newItem;
  }

  deleteHistoryItem(userId: string, id: string): boolean {
    const initialLen = this.data.history.length;
    this.data.history = this.data.history.filter(h => !(h.userId === userId && h.id === id));
    this.save();
    return this.data.history.length < initialLen;
  }

  // --- Export All Data ---
  exportUserData(userId: string) {
    const user = this.findUserById(userId);
    if (!user) return null;

    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      healthProfile: this.getHealthProfile(userId),
      medications: this.getMedications(userId),
      conversations: this.getConversations(userId),
      history: this.getHistory(userId),
    };
  }
}

export const db = new DatabaseStorage();
