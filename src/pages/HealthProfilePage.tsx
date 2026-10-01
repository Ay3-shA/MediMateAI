import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Heart, 
  AlertCircle, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  PhoneCall, 
  Activity,
  Calendar,
  Lock
} from 'lucide-react';
import { api } from '../api/client';
import { HealthProfile, Allergy } from '../types';

export const HealthProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState<HealthProfile['sex']>('prefer_not_to_say');
  const [bloodType, setBloodType] = useState<HealthProfile['bloodType']>('unknown');
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [medicalHistory, setMedicalHistory] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Allergy modal / input states
  const [newAllergyName, setNewAllergyName] = useState('');
  const [newAllergySeverity, setNewAllergySeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [newAllergyReaction, setNewAllergyReaction] = useState('');
  const [newCondition, setNewCondition] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.get<HealthProfile>('/profile');
      setProfile(data);
      if (data) {
        setDateOfBirth(data.dateOfBirth || '');
        setSex(data.sex || 'prefer_not_to_say');
        setBloodType(data.bloodType || 'unknown');
        setHeightCm(data.heightCm ? String(data.heightCm) : '');
        setWeightKg(data.weightKg ? String(data.weightKg) : '');
        setAllergies(data.allergies || []);
        setChronicConditions(data.chronicConditions || []);
        setMedicalHistory(data.medicalHistory || '');
        setFamilyHistory(data.familyHistory || '');
        setEmergencyName(data.emergencyContact?.name || '');
        setEmergencyRel(data.emergencyContact?.relationship || '');
        setEmergencyPhone(data.emergencyContact?.phone || '');
      }
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setErrorMessage('Could not load health profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAddAllergy = () => {
    if (!newAllergyName.trim()) return;
    setAllergies(prev => [
      ...prev,
      {
        name: newAllergyName.trim(),
        severity: newAllergySeverity,
        reaction: newAllergyReaction.trim() || undefined,
      },
    ]);
    setNewAllergyName('');
    setNewAllergyReaction('');
  };

  const handleRemoveAllergy = (idx: number) => {
    setAllergies(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    if (!chronicConditions.includes(newCondition.trim())) {
      setChronicConditions(prev => [...prev, newCondition.trim()]);
    }
    setNewCondition('');
  };

  const handleRemoveCondition = (condition: string) => {
    setChronicConditions(prev => prev.filter(c => c !== condition));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload: Partial<HealthProfile> = {
        dateOfBirth: dateOfBirth || undefined,
        sex,
        bloodType,
        heightCm: heightCm ? parseFloat(heightCm) : undefined,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        allergies,
        chronicConditions,
        medicalHistory,
        familyHistory,
        emergencyContact: emergencyName.trim() ? {
          name: emergencyName.trim(),
          relationship: emergencyRel.trim(),
          phone: emergencyPhone.trim(),
        } : undefined,
      };

      const updated = await api.put<HealthProfile>('/profile', payload);
      setProfile(updated);
      setSuccessMessage('Health profile successfully updated.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save health profile.');
    } finally {
      setSaving(false);
    }
  };

  // BMI Calculation
  const calculateBMI = () => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const heightM = h / 100;
    const bmi = w / (heightM * heightM);
    let category = '';
    let colorClass = '';

    if (bmi < 18.5) {
      category = 'Underweight';
      colorClass = 'text-amber-600 bg-amber-50';
    } else if (bmi < 25) {
      category = 'Normal weight';
      colorClass = 'text-emerald-700 bg-emerald-50';
    } else if (bmi < 30) {
      category = 'Overweight';
      colorClass = 'text-amber-600 bg-amber-50';
    } else {
      category = 'Obesity range';
      colorClass = 'text-rose-600 bg-rose-50';
    }

    return { value: bmi.toFixed(1), category, colorClass };
  };

  const bmiData = calculateBMI();

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
        Loading confidential health profile...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
            Patient Dossier
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Personal Health Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your baseline medical facts, allergies, and emergency points of contact in full privacy.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          <Lock className="w-3.5 h-3.5 text-cyan-600" />
          <span>Encrypted and scoped to your account</span>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        
        {/* Section 1: Demographics & Biometrics */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600" />
              Biometrics & Basic Information
            </h3>
            <span className="text-[11px] text-slate-400">Optional clinical context</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Sex (Assigned at Birth)</label>
              <select
                value={sex}
                onChange={e => setSex(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 text-slate-900"
              >
                <option value="prefer_not_to_say">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Blood Type</label>
              <select
                value={bloodType}
                onChange={e => setBloodType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 text-slate-900"
              >
                <option value="unknown">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Height (cm)</label>
              <input
                type="number"
                step="0.5"
                min="50"
                max="260"
                value={heightCm}
                onChange={e => setHeightCm(e.target.value)}
                placeholder="e.g. 175"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="350"
                value={weightKg}
                onChange={e => setWeightKg(e.target.value)}
                placeholder="e.g. 70"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 text-slate-900"
              />
            </div>

            {/* Calculated BMI */}
            {bmiData && (
              <div className="sm:col-span-2 lg:col-span-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Calculated Body Mass Index (BMI)</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-lg font-bold text-slate-900 tabular-nums">{bmiData.value}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bmiData.colorClass}`}>
                      {bmiData.category}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 max-w-xs text-right">
                  BMI is a screening metric and does not distinguish between muscle mass and adiposity.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Allergies */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Allergies & Adverse Reactions ({allergies.length})
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Record drug, food, or environmental hypersensitivities so AI can flag contraindications.
              </p>
            </div>
          </div>

          {/* Add Allergy Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="sm:col-span-4">
              <input
                type="text"
                value={newAllergyName}
                onChange={e => setNewAllergyName(e.target.value)}
                placeholder="Substance (e.g. Penicillin, Peanuts)"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              />
            </div>
            <div className="sm:col-span-3">
              <select
                value={newAllergySeverity}
                onChange={e => setNewAllergySeverity(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              >
                <option value="mild">Mild (rash / itching)</option>
                <option value="moderate">Moderate (hives / swelling)</option>
                <option value="severe">Severe (anaphylaxis / breathing)</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <input
                type="text"
                value={newAllergyReaction}
                onChange={e => setNewAllergyReaction(e.target.value)}
                placeholder="Reaction description (optional)"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleAddAllergy}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* List of current allergies */}
          {allergies.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No known allergies logged.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {allergies.map((allergy, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{allergy.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        allergy.severity === 'severe'
                          ? 'bg-rose-100 text-rose-800'
                          : allergy.severity === 'moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {allergy.severity}
                      </span>
                    </div>
                    {allergy.reaction && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{allergy.reaction}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergy(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Chronic Conditions & Medical History */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-600" />
                Medical Conditions & Health Background
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Chronic conditions, previous surgeries, and family predispositions.
              </p>
            </div>
          </div>

          {/* Chronic Conditions Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Known Chronic or Recurring Conditions</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCondition}
                onChange={e => setNewCondition(e.target.value)}
                placeholder="e.g. Hypertension, Type 2 Diabetes, Migraines"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Add Condition
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {chronicConditions.map((cond, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-xs font-medium text-slate-800 border border-slate-200"
                >
                  <span>{cond}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(cond)}
                    className="hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
              {chronicConditions.length === 0 && (
                <span className="text-xs text-slate-400">No chronic conditions listed.</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Past Surgeries & Significant Medical History</label>
              <textarea
                rows={3}
                value={medicalHistory}
                onChange={e => setMedicalHistory(e.target.value)}
                placeholder="e.g. Appendectomy in 2014, knee arthroscopy, regular aerobic runner..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Family Health History (Optional)</label>
              <textarea
                rows={3}
                value={familyHistory}
                onChange={e => setFamilyHistory(e.target.value)}
                placeholder="e.g. Maternal history of early cardiovascular disease, paternal diabetes..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Emergency Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                Emergency Contact
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Who should be notified in case of a critical acute medical event.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Contact Full Name</label>
              <input
                type="text"
                value={emergencyName}
                onChange={e => setEmergencyName(e.target.value)}
                placeholder="e.g. David Jenkins"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Relationship</label>
              <input
                type="text"
                value={emergencyRel}
                onChange={e => setEmergencyRel(e.target.value)}
                placeholder="e.g. Spouse / Parent / Sibling"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Phone Number</label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={e => setEmergencyPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Changes take effect immediately across all AI consultations.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Health Profile</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
