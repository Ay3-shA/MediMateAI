import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquareHeart, 
  UserCheck, 
  Pill, 
  History, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Activity, 
  Calendar,
  Sparkles,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { api } from '../api/client';
import { HealthProfile, Medication, Conversation, HealthHistoryItem } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [history, setHistory] = useState<HealthHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, medsData, convsData, histData] = await Promise.all([
        api.get<HealthProfile>('/profile'),
        api.get<Medication[]>('/medications'),
        api.get<Conversation[]>('/conversations'),
        api.get<HealthHistoryItem[]>('/history'),
      ]);
      setProfile(profileData);
      setMedications(medsData);
      setConversations(convsData);
      setHistory(histData.slice(0, 5));
    } catch (err: any) {
      console.error('Dashboard data fetch error:', err);
      setError('Unable to load latest dashboard metrics. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleDose = async (med: Medication) => {
    const isTakenToday = med.logs?.some(l => l.date === todayStr && l.taken);
    try {
      const updated = await api.patch<Medication>(`/medications/${med.id}/log`, {
        date: todayStr,
        taken: !isTakenToday,
      });
      setMedications(prev => prev.map(m => m.id === updated.id ? updated : m));
    } catch (err) {
      console.error('Failed to toggle dose:', err);
    }
  };

  // Calculate Health Profile completeness score
  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    let filled = 0;
    const total = 7;
    if (profile.dateOfBirth) filled++;
    if (profile.sex) filled++;
    if (profile.bloodType && profile.bloodType !== 'unknown') filled++;
    if (profile.heightCm && profile.weightKg) filled++;
    if (profile.allergies && profile.allergies.length > 0) filled++;
    if (profile.chronicConditions && profile.chronicConditions.length > 0) filled++;
    if (profile.emergencyContact?.name && profile.emergencyContact?.phone) filled++;
    return Math.round((filled / total) * 100);
  };

  const profileScore = calculateProfileCompletion();
  const activeMedications = medications.filter(m => m.active);

  return (
    <div className="space-y-6 text-left">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
            Personal Health Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            {getGreeting()}, {user?.name || 'Friend'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here is your health overview, daily medication schedule, and recent AI guidance.
          </p>
        </div>

        <Link
          to="/chat"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-md transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Ask MediMateAI</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="font-semibold underline">Retry</button>
        </div>
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/chat"
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-cyan-300 hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <MessageSquareHeart className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Ask MediMateAI</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Discuss symptoms safely</p>
        </Link>

        <Link
          to="/health-profile"
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-cyan-300 hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <UserCheck className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Health Profile</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Update baseline records</p>
        </Link>

        <Link
          to="/medications"
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-cyan-300 hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Pill className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Medications</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Track daily doses</p>
        </Link>

        <Link
          to="/history"
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-cyan-300 hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <History className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Health Timeline</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Review diary & logs</p>
        </Link>
      </div>

      {/* Main Grid: Left (Meds & Recent Chats), Right (Profile Completion & Recent Logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Active Medications & Recent Consultations */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Medications Tracker */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-cyan-600" />
                  Today's Medications ({activeMedications.length})
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Check off doses as you take them today
                </p>
              </div>
              <Link
                to="/medications"
                className="text-xs text-cyan-700 hover:text-cyan-900 font-semibold flex items-center gap-1"
              >
                <span>Manage all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Loading scheduled medications...
              </div>
            ) : activeMedications.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center space-y-2">
                <Pill className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-medium text-slate-700">No active medications added yet</p>
                <p className="text-[11px] text-slate-400">Keep track of your prescriptions and vitamins here.</p>
                <Link
                  to="/medications"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Medication</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeMedications.map(med => {
                  const takenToday = med.logs?.some(l => l.date === todayStr && l.taken);
                  return (
                    <div key={med.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">{med.name}</span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {med.dosage}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {med.frequency} {med.instructions ? `· ${med.instructions}` : ''}
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleDose(med)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                          takenToday
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${takenToday ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{takenToday ? 'Taken Today' : 'Mark Taken'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent AI Consultations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquareHeart className="w-4 h-4 text-cyan-600" />
                  Recent Health Consultations
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Your ongoing discussions and symptom clarifications
                </p>
              </div>
              <Link
                to="/chat"
                className="text-xs text-cyan-700 hover:text-cyan-900 font-semibold flex items-center gap-1"
              >
                <span>New Conversation</span>
                <Plus className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center space-y-2">
                <MessageSquareHeart className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-medium text-slate-700">No health consultations started yet</p>
                <p className="text-[11px] text-slate-400">Discuss new symptoms or review lab questions anytime.</p>
                <Link
                  to="/chat"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium mt-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Start First Consultation</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {conversations.slice(0, 3).map(conv => {
                  const lastMessage = conv.messages[conv.messages.length - 1];
                  const dateFormatted = new Date(conv.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <Link
                      key={conv.id}
                      to={`/chat/${conv.id}`}
                      className="block p-3.5 rounded-xl border border-slate-100 hover:border-cyan-200 hover:bg-slate-50 transition-all group"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-900 truncate group-hover:text-cyan-700 transition-colors">
                          {conv.title}
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0 font-mono-numbers">
                          {dateFormatted}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1">
                        {lastMessage ? lastMessage.content.slice(0, 110) : 'No messages yet.'}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (4 cols): Health Profile Completion & Recent Activity */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Health Profile Completeness Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-600" />
                Profile Completeness
              </h3>
              <span className="text-xs font-bold text-cyan-700 tabular-nums">
                {profileScore}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-cyan-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${profileScore}%` }}
              />
            </div>

            <div className="text-[11px] text-slate-500 leading-relaxed">
              {profileScore >= 90 ? (
                <p className="text-emerald-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Your medical dossier is comprehensive and ready for AI guidance context.
                </p>
              ) : (
                <p>
                  A complete profile allows MediMateAI to factor in allergies, age, and chronic conditions accurately.
                </p>
              )}
            </div>

            {/* Snapshot metrics */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Blood Type</span>
                <span className="font-bold text-slate-800">{profile?.bloodType || 'Not set'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Allergies</span>
                <span className="font-bold text-slate-800">{profile?.allergies?.length || 0} recorded</span>
              </div>
            </div>

            <Link
              to="/health-profile"
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors"
            >
              <span>Update Health Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Recent Activity Timeline Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-600" />
                Recent Health Log
              </h3>
              <Link to="/history" className="text-xs text-cyan-700 hover:underline font-medium">
                View all
              </Link>
            </div>

            {loading ? (
              <div className="py-4 text-center text-xs text-slate-400 animate-pulse">Loading activity...</div>
            ) : history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent health entries logged.</p>
            ) : (
              <div className="space-y-3">
                {history.map(item => (
                  <div key={item.id} className="text-xs border-l-2 border-slate-200 pl-3 space-y-0.5">
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="text-[11px] text-slate-500 leading-tight">{item.description}</p>
                    <p className="text-[10px] text-slate-400 font-mono-numbers">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
