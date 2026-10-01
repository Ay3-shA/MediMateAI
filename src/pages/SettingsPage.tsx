import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, 
  User, 
  Lock, 
  Bell, 
  Download, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck,
  Save,
  KeyRound
} from 'lucide-react';
import { api } from '../api/client';

export const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification Preferences (local storage)
  const [medReminders, setMedReminders] = useState(() => localStorage.getItem('medimate_reminders') !== 'false');
  const [weeklySummaries, setWeeklySummaries] = useState(() => localStorage.getItem('medimate_summaries') === 'true');

  // Danger Zone
  const [clearingChats, setClearingChats] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const updated = await api.put<{ id: string; name: string; email: string; createdAt: string }>('/settings/profile', {
        name: name.trim(),
        email: email.trim(),
      });
      updateUser(updated);
      setProfileSuccess('Profile information updated successfully.');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      await api.put('/settings/password', { currentPassword, newPassword });
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('medimate_token');
      const response = await fetch('/api/settings/export', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Export failed.');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medimate_health_archive_${user?.id || 'data'}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to export data archive.');
    }
  };

  const handleClearConversations = async () => {
    if (!window.confirm('Are you sure you want to delete all conversation history? This cannot be undone.')) return;
    setClearingChats(true);
    try {
      const res = await api.delete<{ message: string }>('/settings/conversations');
      alert(res.message);
    } catch (err) {
      alert('Failed to clear conversations.');
    } finally {
      setClearingChats(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'Type "DELETE" to permanently erase your account, medical profile, medications, and conversation logs:'
    );
    if (confirmation !== 'DELETE') {
      alert('Account deletion cancelled.');
      return;
    }

    setDeletingAccount(true);
    try {
      await api.delete('/settings/account');
      alert('Your account and all associated health data have been completely removed.');
      logout();
      navigate('/');
    } catch (err) {
      alert('Failed to delete account.');
      setDeletingAccount(false);
    }
  };

  const handleToggleReminders = (checked: boolean) => {
    setMedReminders(checked);
    localStorage.setItem('medimate_reminders', String(checked));
  };

  const handleToggleSummaries = (checked: boolean) => {
    setWeeklySummaries(checked);
    localStorage.setItem('medimate_summaries', String(checked));
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
          Account Administration
        </span>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          Settings & Data Governance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your credentials, notification preferences, and export or purge your medical records on demand.
        </p>
      </div>

      {/* 1. Profile Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-5 h-5 text-cyan-600" />
          <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
        </div>

        {profileSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{profileSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Security & Password */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <KeyRound className="w-5 h-5 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900">Security & Credentials</h3>
        </div>

        {passwordSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordSaving}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{passwordSaving ? 'Updating...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Notifications & Reminders */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Bell className="w-5 h-5 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-900">Reminders & Notifications</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-xs font-semibold text-slate-900">Medication Dose Reminders</p>
              <p className="text-[11px] text-slate-500">Show in-app reminders when morning, afternoon, or evening doses are due.</p>
            </div>
            <input
              type="checkbox"
              checked={medReminders}
              onChange={e => handleToggleReminders(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-xs font-semibold text-slate-900">Weekly Health Summary Review</p>
              <p className="text-[11px] text-slate-500">Receive periodic insights on consultation logs and prescription adherence.</p>
            </div>
            <input
              type="checkbox"
              checked={weeklySummaries}
              onChange={e => handleToggleSummaries(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Data Management & Portability */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Download className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Data Portability & Export</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900">Export Complete Health Dossier</h4>
            <p className="text-xs text-slate-500 max-w-lg">
              Download all your profile details, active and past medications, adherence logs, and conversation transcripts in standard JSON format.
            </p>
          </div>
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-cyan-600" />
            <span>Export Archive</span>
          </button>
        </div>
      </div>

      {/* 5. Danger Zone (Clear Chats, Delete Account) */}
      <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-rose-100">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <h3 className="text-sm font-bold text-rose-900">Danger Zone</h3>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-rose-50/50 rounded-xl border border-rose-100">
            <div>
              <p className="text-xs font-bold text-rose-900">Clear All Consultations</p>
              <p className="text-[11px] text-rose-700">Permanently delete all previous conversation messages with MediMateAI.</p>
            </div>
            <button
              onClick={handleClearConversations}
              disabled={clearingChats}
              className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-colors shrink-0"
            >
              {clearingChats ? 'Clearing...' : 'Clear All Chats'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-rose-50/50 rounded-xl border border-rose-100">
            <div>
              <p className="text-xs font-bold text-rose-900">Permanently Delete Account</p>
              <p className="text-[11px] text-rose-700">Wipe your account, health profile, medications, and activity timeline irrevocably.</p>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
            >
              {deletingAccount ? 'Purging...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
