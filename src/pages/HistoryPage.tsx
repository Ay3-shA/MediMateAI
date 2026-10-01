import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  Search, 
  MessageSquare, 
  Pill, 
  UserCheck, 
  FileText, 
  Plus, 
  Trash2, 
  X,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../api/client';
import { HealthHistoryItem } from '../types';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HealthHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'consultation' | 'medication' | 'profile' | 'note'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Note Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<HealthHistoryItem[]>('/history');
      setHistory(data);
    } catch (err: any) {
      console.error('Failed to load history:', err);
      setError('Could not retrieve health timeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) {
      alert('Please fill in both title and description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newNote = await api.post<HealthHistoryItem>('/history/notes', {
        title: noteTitle.trim(),
        description: noteContent.trim(),
      });
      setHistory(prev => [newNote, ...prev]);
      setModalOpen(false);
      setNoteTitle('');
      setNoteContent('');
    } catch (err: any) {
      alert(err.message || 'Failed to save note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Remove this entry from your health timeline?')) return;
    try {
      await api.delete(`/history/${id}`);
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete history item.');
    }
  };

  const getIconForType = (type: HealthHistoryItem['type']) => {
    switch (type) {
      case 'consultation':
        return <MessageSquare className="w-4 h-4 text-cyan-600" />;
      case 'medication':
        return <Pill className="w-4 h-4 text-teal-600" />;
      case 'profile':
        return <UserCheck className="w-4 h-4 text-sky-600" />;
      case 'note':
      default:
        return <FileText className="w-4 h-4 text-amber-600" />;
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
            Continuous Longitudinal Log
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Health & Activity Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            A chronological record of previous consultations, medication changes, dose tracking, and personal diary notes.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Health Diary Note</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchHistory} className="font-semibold underline">Retry</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setActiveFilter('consultation')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeFilter === 'consultation' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Consultations
          </button>
          <button
            onClick={() => setActiveFilter('medication')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeFilter === 'medication' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Medications
          </button>
          <button
            onClick={() => setActiveFilter('note')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeFilter === 'note' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Diary Notes
          </button>
          <button
            onClick={() => setActiveFilter('profile')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeFilter === 'profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profile Updates
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search timeline..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 text-slate-900"
          />
        </div>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
          Loading health timeline...
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
          <History className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No timeline entries found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery 
              ? 'No events match your current filter query.' 
              : 'As you discuss symptoms, log medications, or write health notes, your events will be chronologically tracked here.'}
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Note</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200">
          {filteredHistory.map(item => (
            <div key={item.id} className="relative flex items-start gap-4 pl-1 group">
              
              {/* Type Badge on Timeline */}
              <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 z-10 group-hover:border-cyan-500 transition-colors shadow-xs">
                {getIconForType(item.type)}
              </div>

              {/* Item Card */}
              <div className="flex-1 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      {item.type}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono-numbers text-slate-400">
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      title="Remove Entry"
                      className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>

                {item.metadata?.conversationId && (
                  <div className="pt-2">
                    <Link
                      to={`/chat/${item.metadata.conversationId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 hover:text-cyan-900"
                    >
                      <span>Resume this consultation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Note Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Add Health Diary Note</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Note Title *</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  placeholder="e.g. Morning Blood Pressure, Migraine Observation"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Description / Details *</label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Describe reading, onset, triggers, food consumed, or notes for doctor..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 text-slate-900 resize-none"
                />
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
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
