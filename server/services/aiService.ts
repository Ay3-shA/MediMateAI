import { GoogleGenAI } from '@google/genai';
import { HealthProfileDoc, MedicationDoc } from '../db/database';

interface GenerateOptions {
  userMessage: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  userProfile?: HealthProfileDoc;
  userMedications?: MedicationDoc[];
}

export interface AssistantResponse {
  content: string;
  isUrgent: boolean;
  suggestedQuestions: string[];
}

// Emergency red flag terms that trigger urgent clinical safety alerts
const EMERGENCY_PATTERNS = [
  /\b(chest pain|crushing pain in chest|pressure in chest|heart attack|angina)\b/i,
  /\b(can't breathe|difficulty breathing|gasping for air|severe shortness of breath|choking)\b/i,
  /\b(stroke|face drooping|arm weakness|slurred speech|sudden numbness)\b/i,
  /\b(anaphylaxis|throat swelling|lip swelling|tongue swelling|allergic reaction.*cannot breathe)\b/i,
  /\b(coughing.*blood|vomiting.*blood|uncontrolled bleeding)\b/i,
  /\b(suicide|kill myself|end my life|want to die|self-harm)\b/i,
  /\b(sudden loss of vision|thunderclap headache|worst headache of my life)\b/i,
  /\b(loss of consciousness|passed out|fainted.*chest pain|unresponsive)\b/i,
];

export class SafetyGuardrailService {
  public static checkEmergency(text: string): { isUrgent: boolean; triggerReason?: string } {
    for (const pattern of EMERGENCY_PATTERNS) {
      if (pattern.test(text)) {
        return { isUrgent: true, triggerReason: 'Potential acute medical emergency detected.' };
      }
    }
    return { isUrgent: false };
  }

  public static appendEmergencyAdvisory(content: string, triggerReason?: string): string {
    const banner = `⚠️ **URGENT MEDICAL SAFETY NOTICE**
If you or someone nearby are experiencing severe chest discomfort, difficulty breathing, sudden weakness, numbness, or another acute emergency, **please contact 911 (or your local emergency services) or proceed to the nearest emergency department immediately.**

---

`;
    return banner + content;
  }
}

export class AIService {
  private client: GoogleGenAI | null = null;
  private provider: string;
  private modelName: string;

  constructor() {
    this.provider = process.env.AI_PROVIDER || 'gemini';
    this.modelName = process.env.AI_MODEL || 'gemini-3.8-flash';

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        this.client = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } catch (err) {
        console.warn('Failed to initialize GoogleGenAI client, will use heuristic fallback:', err);
      }
    }
  }

  private buildSystemPrompt(userProfile?: HealthProfileDoc, userMedications?: MedicationDoc[]): string {
    let contextStr = '';
    
    if (userProfile) {
      const allergies = userProfile.allergies?.map(a => `${a.name} (${a.severity})`).join(', ') || 'None reported';
      const conditions = userProfile.chronicConditions?.join(', ') || 'None reported';
      contextStr += `\n[Patient Known Profile]:
- Sex: ${userProfile.sex || 'Not specified'}
- Blood Type: ${userProfile.bloodType || 'Unknown'}
- Chronic Conditions: ${conditions}
- Known Allergies: ${allergies}
- Medical History Notes: ${userProfile.medicalHistory || 'None'}
`;
    }

    if (userMedications && userMedications.length > 0) {
      const meds = userMedications.filter(m => m.active).map(m => `${m.name} (${m.dosage}, ${m.frequency})`).join('; ');
      contextStr += `\n[Current Active Medications]: ${meds}\n`;
    }

    return `You are MediMateAI, a calm, trustworthy, modern personal health companion and medical guidance assistant.

PRIMARY ETHICAL & CLINICAL MANDATES:
1. NON-DIAGNOSTIC: You provide educational health guidance, symptom clarification, and supportive organization. You are NOT a doctor and CANNOT provide a confirmed medical diagnosis or write prescriptions.
2. COMMUNICATE UNCERTAINTY: Clearly communicate medical uncertainty (e.g., "While this symptom is commonly seen in X, only an in-person clinical exam can determine the exact cause").
3. ASK CLARIFYING QUESTIONS: Inquire about symptom onset, duration, severity scale (1-10), aggravating/alleviating factors, and related physical indicators.
4. DOCTOR PREPARATION: Provide specific, high-value questions the user can ask their healthcare provider during their next consultation.
5. NO FABRICATION: Never invent lab values, clinical trials, or medical facts.
6. EMERGENCY RED FLAGS: For acute life-threatening situations (cardiac symptoms, respiratory failure, stroke signs, anaphylaxis, severe trauma), immediately advise contacting emergency services (911 / local emergency).
7. TONE: Professional, reassuring, calm, clear, and empathetic. Avoid unnecessary panic or medical jargon without clear explanations.
8. FORMATTING: Use structured bullet points, clear bold headings, and end with 2-3 brief suggested follow-up questions formatted on separate lines beginning with "SUGGESTED_QUESTION: ".

${contextStr}`;
  }

  public async generateMedicalResponse(options: GenerateOptions): Promise<AssistantResponse> {
    const { userMessage, history, userProfile, userMedications } = options;

    // Check emergency guardrails upfront
    const userEmergencyCheck = SafetyGuardrailService.checkEmergency(userMessage);

    let rawContent = '';
    let suggestedQuestions: string[] = [];

    // Attempt Gemini API if client is available
    if (this.client) {
      try {
        const systemInstruction = this.buildSystemPrompt(userProfile, userMedications);

        // Format conversation history for Gemini
        const contents: any[] = [];
        
        for (const msg of history.slice(-8)) { // Last 8 messages for context
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          });
        }

        // Add current user prompt
        contents.push({
          role: 'user',
          parts: [{ text: userMessage }],
        });

        const response = await this.client.models.generateContent({
          model: this.modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            topP: 0.95,
          },
        });

        if (response.text) {
          rawContent = response.text;
        }
      } catch (err) {
        console.error('Gemini API call failed, falling back to clinical rule engine:', err);
      }
    }

    // If Gemini was not configured or call failed, use clinical heuristic fallback
    if (!rawContent) {
      const fallbackResult = this.generateClinicalFallback(userMessage, userProfile, userMedications);
      rawContent = fallbackResult.content;
      suggestedQuestions = fallbackResult.suggestedQuestions;
    } else {
      // Parse out SUGGESTED_QUESTION markers from Gemini output
      const lines = rawContent.split('\n');
      const filteredLines: string[] = [];

      for (const line of lines) {
        if (line.startsWith('SUGGESTED_QUESTION:')) {
          const q = line.replace('SUGGESTED_QUESTION:', '').trim();
          if (q.length > 5) {
            suggestedQuestions.push(q);
          }
        } else {
          filteredLines.push(line);
        }
      }
      rawContent = filteredLines.join('\n').trim();

      // If no suggestions found, provide domain-relevant suggestions
      if (suggestedQuestions.length === 0) {
        suggestedQuestions = this.getDefaultQuestions(userMessage);
      }
    }

    // Check assistant output for emergency flags as well
    const assistantEmergencyCheck = SafetyGuardrailService.checkEmergency(rawContent);
    const isUrgent = userEmergencyCheck.isUrgent || assistantEmergencyCheck.isUrgent;

    let finalContent = rawContent;
    if (isUrgent) {
      finalContent = SafetyGuardrailService.appendEmergencyAdvisory(rawContent, userEmergencyCheck.triggerReason);
    }

    return {
      content: finalContent,
      isUrgent,
      suggestedQuestions: suggestedQuestions.slice(0, 3),
    };
  }

  private getDefaultQuestions(userMessage: string): string[] {
    const lower = userMessage.toLowerCase();
    if (lower.includes('medication') || lower.includes('pill') || lower.includes('dose')) {
      return [
        'What are the common side effects of this medication?',
        'Can I take this medication with food or other supplements?',
        'What should I do if I accidentally miss a dose?'
      ];
    }
    if (lower.includes('lab') || lower.includes('test') || lower.includes('blood')) {
      return [
        'What does this specific lab value indicate?',
        'Are there lifestyle factors that influence this result?',
        'When is a follow-up test typically recommended?'
      ];
    }
    return [
      'What symptoms would indicate this is getting worse?',
      'What questions should I bring to my doctor appointment?',
      'Are there gentle at-home comfort measures to try?'
    ];
  }

  private generateClinicalFallback(
    message: string, 
    userProfile?: HealthProfileDoc,
    userMedications?: MedicationDoc[]
  ): { content: string; suggestedQuestions: string[] } {
    const text = message.toLowerCase();

    // 1. Emergency Detection
    if (SafetyGuardrailService.checkEmergency(message).isUrgent) {
      return {
        content: `Based on what you've described, these symptoms can be associated with acute conditions that require **immediate evaluation by medical professionals**.

### Recommended Immediate Steps:
1. **Call 911 or your local emergency number** immediately.
2. Do not attempt to drive yourself to the hospital; await paramedics.
3. Stay in a safe, seated position, loosen tight clothing around your neck or waist, and try to take steady, gentle breaths.
4. If someone is with you, alert them to what you are experiencing so they can assist first responders.

*MediMateAI cannot diagnose or treat emergencies. Please prioritize immediate clinical care.*`,
        suggestedQuestions: [
          'What information should I have ready for emergency personnel?',
          'What are typical warning signs for cardiovascular emergencies?',
        ]
      };
    }

    // 2. Medication-related questions
    if (text.includes('medication') || text.includes('drug') || text.includes('dose') || text.includes('side effect') || text.includes('pill')) {
      const activeMeds = userMedications?.filter(m => m.active).map(m => m.name).join(', ');
      return {
        content: `When reviewing medications and potential interactions, it is essential to consider both the dosage schedule and personal health context.${activeMeds ? `\n\n*Your profile lists active medications: ${activeMeds}.*` : ''}

### General Medication Guidelines:
* **Consistency**: Take medications at the prescribed times each day to maintain steady therapeutic levels.
* **Food & Hydration**: Verify whether your medication requires a full meal, a light snack, or an empty stomach, and drink plenty of water unless on fluid restriction.
* **Interactions**: Certain over-the-counter pain relievers (like NSAIDs), grapefruit juice, and herbal supplements (like St. John's Wort) can interact with common prescriptions.

### Questions for Your Pharmacist or Doctor:
1. *"Are there any known interactions between my current prescriptions and common OTC medications?"*
2. *"What should I do if I experience nausea, dizziness, or a missed dose?"*
3. *"Does this medication require routine blood monitoring (e.g. liver enzymes, kidney function)?"*`,
        suggestedQuestions: [
          'What is the best way to handle a missed dose?',
          'Can I take vitamins or supplements with this?',
          'How can I track my medication schedule easily?'
        ]
      };
    }

    // 3. Headache & Pain
    if (text.includes('headache') || text.includes('migraine') || text.includes('head pain')) {
      return {
        content: `Headaches can stem from a wide range of everyday factors, though persistent or unusually severe pain warrants clinical review.

### Potential Contributing Factors:
* **Tension & Posture**: Prolonged screen use, neck muscle strain, or emotional stress often cause band-like tension headaches.
* **Hydration & Electrolytes**: Mild dehydration is one of the most common reversible causes of dull head pain.
* **Sleep Disruption**: Irregular sleep schedules, caffeine withdrawal, or skipping meals can trigger episodic pain.

### Supportive Self-Care:
* Rest in a quiet, dimly lit room with a cool or warm compress applied to your forehead or the back of your neck.
* Sip 16–20 ounces of water steadily.
* Gentle neck and shoulder mobility stretches.

### ⚠️ When to Seek Urgent Evaluation:
Seek immediate emergency medical care if the headache is sudden and explosive ("thunderclap"), accompanied by high fever and stiff neck, confusion, weakness, or vision changes.`,
        suggestedQuestions: [
          'What is the difference between a tension headache and a migraine?',
          'What triggers should I track in a symptom diary?',
          'When does frequent headache warrant a specialist visit?'
        ]
      };
    }

    // 4. Cough, Cold, Respiratory
    if (text.includes('cough') || text.includes('cold') || text.includes('sore throat') || text.includes('fever') || text.includes('congestion')) {
      return {
        content: `Respiratory symptoms such as cough, congestion, and mild fever are frequently triggered by common viral upper respiratory infections.

### Observations to Note:
* **Duration**: Most viral coughs resolve within 10 to 14 days; persistent cough beyond 3 weeks should be examined by a clinician.
* **Characteristics**: Is the cough productive (bringing up clear, yellow, or green mucus) or dry and tickly?
* **Associated Signs**: Are you experiencing body aches, chills, or difficulty swallowing?

### Supportive Measures:
* Stay well hydrated with warm broths, herbal teas with honey, and water.
* Use a cool-mist humidifier in your bedroom.
* Saline nasal rinses can help clear congested nasal passages safely.

### When to Contact a Doctor:
Reach out to your clinic if your fever stays above 102°F (38.9°C), symptoms worsen after 7 days, or if you develop chest tightness or shortness of breath.`,
        suggestedQuestions: [
          'How long does a typical viral cough usually last?',
          'What questions should I ask at my doctor appointment?',
          'What are effective non-medication comfort measures?'
        ]
      };
    }

    // 5. Default Comprehensive Health Response
    return {
      content: `Thank you for sharing your health question. I am here to help you understand your wellness context and prepare for informed conversations with your healthcare team.

### Clinical Considerations to Keep in Mind:
* **Context & Timeline**: Tracking when symptoms first appeared, how often they occur, and whether they are stable, improving, or worsening provides vital data for your physician.
* **Triggers & Relief**: Note whether specific foods, movements, times of day, or stress levels influence how you feel.
* **Overall Vitality**: Pay attention to your energy levels, sleep quality, and appetite.

### Suggested Next Steps:
1. **Maintain a Brief Log**: Note the timing and severity of symptoms in your MediMateAI Health History.
2. **Review with a Clinician**: Use this information to guide your next routine clinic visit or telehealth check-in.
3. **Seek Prompt Care if Worsening**: If symptoms suddenly intensify or new severe signs develop, do not hesitate to contact your local clinic or urgent care center.`,
      suggestedQuestions: [
        'Can you help me prepare a list of questions for my doctor?',
        'What symptoms should I monitor closely over the next 48 hours?',
        'How does my health profile relate to these symptoms?'
      ]
    };
  }
}

export const aiService = new AIService();
