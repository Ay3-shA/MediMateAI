import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pill, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Edit3, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  Check, 
  X,
  FileText
} from 'lucide-react';
import { api } from '../api/client';
import { Medication } from '../types';

export const MedicationsPage: React.FC = () => {
  const navigate = useNavigate();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('active');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<('morning' | 'afternoon' | 'evening' | 'bedtime')[]>(['morning']);
  const [instructions, setInstructions] = useState('');
  const [prescribedFor, setPrescribedFor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchMedications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Medication[]>('/medications');
      setMedications(data);
    } catch (err: any) {
      console.error('Failed to load medications:', err);
      setError('Could not retrieve medications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const resetForm = () => {
    setEditingMed(null);
    setName('');
    setDosage('');
    setFrequency('');
    setTimeOfDay(['morning']);
    setInstructions('');
    setPrescribedFor('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setActive(true);
    setNotes('');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEditModal = (med: Medication) => {
    setEditingMed(med);
    setName(med.name);
    setDosage(med.dosage);
    setFrequency(med.frequency);
    setTimeOfDay(med.timeOfDay || ['morning']);
    setInstructions(med.instructions || '');
    setPrescribedFor(med.prescribedFor || '');
    setStartDate(med.startDate || '');
    setEndDate(med.endDate || '');
    setActive(med.active);
    setNotes(med.notes || '');
    setModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim() || !frequency.trim()) {
      alert('Please fill in medication name, dosage, and frequency.');
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        timeOfDay,
        instructions: instructions.trim() || undefined,
        prescribedFor: prescribedFor.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        active,
        notes: notes.trim() || undefined,
      };

      if (editingMed) {
        const updated = await api.put<Medication>(`/medications/${editingMed.id}`, payload);
        setMedications(prev => prev.map(m => m.id === updated.id ? updated : m));
      } else {
        const created = await api.post<Medication>('/medications', payload);
        setMedications(prev => [created, ...prev]);
      }
      setModalOpen(false);
      resetForm();
    } catch (err: any) {
      alert(err.message || 'Failed to save medication.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteMedication = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from your medication tracker?`)) return;
    try {
      await api.delete(`/medications/${id}`);
      setMedications(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete medication.');
    }
  };

  const handleToggleDose = async (med: Medication) => {
    const isTaken = med.logs?.some(l => l.date === todayStr && l.taken);
    try {
      const updated = await api.patch<Medication>(`/medications/${med.id}/log`, {
        date: todayStr,
        taken: !isTaken,
      });
      setMedications(prev => prev.map(m => m.id === updated.id ? updated : m));
    } catch (err) {
      console.error('Failed to log dose:', err);
    }
  };

  const handleAskAIAboutMed = async (medName: string, dosage: string) => {
    try {
      const conv = await api.post<{ id: string }>('/conversations', {
        title: `Medication Guidance: ${medName}`,
      });
      navigate(`/chat/${conv.id}`);
      // In chat page, the user can immediately discuss this medication
    } catch (err) {
      navigate('/chat');
    }
  };

  const toggleTimeOfDay = (period: 'morning' | 'afternoon' | 'evening' | 'bedtime') => {
    setTimeOfDay(prev =>
      prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]
    );
  };

  // Filtered List
  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (med.prescribedFor && med.prescribedFor.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'active') return matchesSearch && med.active;
    if (activeTab === 'inactive') return matchesSearch && !med.active;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
            Prescription & Wellness Regimen
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Medication Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Keep track of daily schedules, dosages, special instructions, and dose adherence streaks.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medication</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchMedications} className="font-semibold underline">Retry</button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Segmented Active/Inactive Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Regimen ({medications.filter(m => m.active).length})
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'inactive' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inactive / Paused ({medications.filter(m => !m.active).length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({medications.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name or purpose..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 text-slate-900"
          />
        </div>
      </div>

      {/* Medication Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
          Loading medication regimen...
        </div>
      ) : filteredMedications.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
          <Pill className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No medications found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery 
              ? 'No medications match your search query.' 
              : activeTab === 'inactive' 
                ? 'No inactive or completed medications.' 
                : 'Keep your prescription and supplement routines organized in one secure place.'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Medication</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMedications.map(med => {
            const takenToday = med.logs?.some(l => l.date === todayStr && l.taken);

            return (
              <div 
                key={med.id}
                className={`p-5 rounded-2xl border bg-white transition-all space-y-4 shadow-sm ${
                  med.active ? 'border-slate-200 hover:border-cyan-200' : 'border-slate-200/60 opacity-80 bg-slate-50/50'
                }`}
              >
                {/* Top Row: Name, Dosage, Active Status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{med.name}</h3>
                      <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {med.dosage}
                      </span>
                    </div>
                    {med.prescribedFor && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        For {med.prescribedFor}
                      </p>
                    )}
                  </div>

                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    med.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {med.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Schedule & Timing Info */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{med.frequency}</span>
                  </div>

                  {med.timeOfDay && med.timeOfDay.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {med.timeOfDay.map(time => (
                        <span key={time} className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                          {time}
                        </span>
                      ))}
                    </div>
                  )}

                  {med.instructions && (
                    <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-100">
                      <strong>Instructions:</strong> {med.instructions}
                    </div>
                  )}

                  {med.notes && (
                    <p className="text-[11px] text-slate-400 italic">
                      Note: {med.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Today's Dose Toggle & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Dose Toggle */}
                  {med.active ? (
                    <button
                      onClick={() => handleToggleDose(med)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        takenToday
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${takenToday ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{takenToday ? 'Taken Today' : 'Mark Dose Taken'}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Regimen paused</span>
                  )}

                  {/* Actions: Ask AI, Edit, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAskAIAboutMed(med.name, med.dosage)}
                      title="Ask MediMateAI about drug guidance & interactions"
                      className="p-1.5 text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Ask AI</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(med)}
                      title="Edit Medication"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMedication(med.id, med.name)}
                      title="Delete Medication"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Medication Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-cyan-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingMed ? 'Edit Medication' : 'Add New Medication'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Medication Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Lisinopril, Metformin, Vitamin C"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Dosage *</label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={e => setDosage(e.target.value)}
                    placeholder="e.g. 10 mg, 1 tablet, 500 IU"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Frequency *</label>
                  <input
                    type="text"
                    required
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                    placeholder="e.g. Once daily, Twice daily, As needed"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 text-slate-900"
                  />
                </div>
              </div>

              {/* Time of Day selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Schedule / Times of Day</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['morning', 'afternoon', 'evening', 'bedtime'] as const).map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => toggleTimeOfDay(time)}
                      className={`py-1.5 text-xs font-medium rounded-xl capitalize border transition-all ${
                        timeOfDay.includes(time)
                          ? 'bg-cyan-50 border-cyan-300 text-cyan-800 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Purpose / Prescribed For</label>
                <input
                  type="text"
                  value={prescribedFor}
                  onChange={e => setPrescribedFor(e.target.value)}
                  placeholder="e.g. Blood pressure management, allergy control"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Special Instructions</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="e.g. Take with food, drink full glass of water"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">End Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={active}
                  onChange={e => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
                />
                <label htmlFor="activeToggle" className="text-xs font-semibold text-slate-700">
                  Currently active in my medication schedule
                </label>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingMed ? 'Save Changes' : 'Add Medication'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
