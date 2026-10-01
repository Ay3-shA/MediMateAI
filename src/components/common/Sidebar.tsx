import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageSquareHeart, 
  UserCheck, 
  Pill, 
  History, 
  Settings, 
  LogOut, 
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/chat', label: 'AI Health Assistant', icon: MessageSquareHeart },
    { to: '/health-profile', label: 'Health Profile', icon: UserCheck },
    { to: '/medications', label: 'Medications', icon: Pill },
    { to: '/history', label: 'Health Timeline', icon: History },
    { to: '/settings', label: 'Settings & Privacy', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none hidden md:flex">
      {/* Primary Navigation */}
      <div className="p-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Health Management
          </p>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-50/80 text-cyan-800 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-600" />}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Consultation Promo Box */}
        <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl text-white shadow-sm">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Need Health Clarity?</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            Describe symptoms or check drug guidance with MediMateAI anytime.
          </p>
          <NavLink
            to="/chat"
            className="mt-3 block text-center py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-medium text-white transition-colors"
          >
            Start Consultation
          </NavLink>
        </div>
      </div>

      {/* Footer Area: Emergency Notice & User Details */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 text-[11px] text-rose-700 leading-tight flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>For medical emergencies, immediately dial <strong>911</strong> or local emergency services.</span>
        </div>

        {user && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
