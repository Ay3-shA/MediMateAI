export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Allergy {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface HealthProfile {
  id?: string;
  userId: string;
  dateOfBirth?: string;
  sex?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
  heightCm?: number;
  weightKg?: number;
  allergies: Allergy[];
  chronicConditions: string[];
  medicalHistory?: string;
  familyHistory?: string;
  emergencyContact?: EmergencyContact;
  updatedAt: string;
}

export interface Medication {
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
  logs: {
    date: string; // YYYY-MM-DD
    taken: boolean;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isUrgent?: boolean;
  suggestedQuestions?: string[];
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface HealthHistoryItem {
  id: string;
  userId: string;
  type: 'consultation' | 'medication' | 'profile' | 'note';
  title: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
