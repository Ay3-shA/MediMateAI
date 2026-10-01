import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HeartHandshake, 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  Bell, 
  ShieldCheck, 
  MessageSquare, 
  Pill, 
  FileText,
  Clock
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserDropdownOpen(false);
  };

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const isAppPage = ['/dashboard', '/chat', '/health-profile', '/medications', '/history', '/settings'].some(p => location.pathname.startsWith(p));

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single element brand wordmark */}
          <Link 
            to={user ? "/dashboard" : "/"} 
            className="flex items-center gap-2.5 text-slate-900 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20 group-hover:scale-[1.02] transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              MediMate<span className="text-cyan-600 font-extrabold">AI</span>
            </span>
          </Link>

          {/* Zone 2: Navigation Links */}
          {user ? (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link 
                to="/dashboard" 
                className={`transition-colors py-1 ${location.pathname === '/dashboard' ? 'text-cyan-600 font-semibold border-b-2 border-cyan-600' : 'hover:text-slate-900'}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/chat" 
                className={`transition-colors py-1 ${location.pathname.startsWith('/chat') ? 'text-cyan-600 font-semibold border-b-2 border-cyan-600' : 'hover:text-slate-900'}`}
              >
                AI Assistant
              </Link>
              <Link 
                to="/health-profile" 
                className={`transition-colors py-1 ${location.pathname === '/health-profile' ? 'text-cyan-600 font-semibold border-b-2 border-cyan-600' : 'hover:text-slate-900'}`}
              >
                Health Profile
              </Link>
              <Link 
                to="/medications" 
                className={`transition-colors py-1 ${location.pathname === '/medications' ? 'text-cyan-600 font-semibold border-b-2 border-cyan-600' : 'hover:text-slate-900'}`}
              >
                Medications
              </Link>
              <Link 
                to="/history" 
                className={`transition-colors py-1 ${location.pathname === '/history' ? 'text-cyan-600 font-semibold border-b-2 border-cyan-600' : 'hover:text-slate-900'}`}
              >
                Timeline
              </Link>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
              <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
              <a href="#assistant" className="hover:text-slate-900 transition-colors">Clinical Guidance</a>
              <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
              <a href="#safety" className="hover:text-slate-900 transition-colors">Safety Standards</a>
              <a href="#privacy" className="hover:text-slate-900 transition-colors">Privacy</a>
            </nav>
          )}

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                
                {/* Notifications Bell */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-600 rounded-full"></span>
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50">
                      <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Health Reminders</span>
                        <span className="text-[11px] text-cyan-600 font-medium cursor-pointer" onClick={() => setNotificationsOpen(false)}>Close</span>
                      </div>
                      <div className="px-4 py-3 hover:bg-slate-50 transition-colors">
                        <p className="text-xs font-medium text-slate-900">Morning Dose Scheduled</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Time to take your scheduled morning medications.</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-slate-50 transition-colors border-t border-slate-100">
                        <p className="text-xs font-medium text-slate-900">Hydration Check</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Drink a full glass of water with your morning routine.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline-block text-xs font-medium text-slate-800 max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      <Link 
                        to="/dashboard" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        Dashboard
                      </Link>

                      <Link 
                        to="/settings" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Settings & Privacy
                      </Link>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-sm whitespace-nowrap"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 bg-white">
            <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50"
                  >
                    <UserIcon className="w-4 h-4 text-cyan-600" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/chat" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50"
                  >
                    <MessageSquare className="w-4 h-4 text-cyan-600" />
                    AI Health Assistant
                  </Link>
                  <Link 
                    to="/health-profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50"
                  >
                    <ShieldCheck className="w-4 h-4 text-cyan-600" />
                    Health Profile
                  </Link>
                  <Link 
                    to="/medications" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50"
                  >
                    <Pill className="w-4 h-4 text-cyan-600" />
                    Medications
                  </Link>
                  <Link 
                    to="/history" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50"
                  >
                    <Clock className="w-4 h-4 text-cyan-600" />
                    Health Timeline
                  </Link>
                  <Link 
                    to="/settings" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50"
                  >
                    <Settings className="w-4 h-4 text-cyan-600" />
                    Settings
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 text-left mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <a 
                    href="#how-it-works" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 hover:bg-slate-50 rounded-lg"
                  >
                    How It Works
                  </a>
                  <a 
                    href="#features" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 hover:bg-slate-50 rounded-lg"
                  >
                    Features
                  </a>
                  <a 
                    href="#safety" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 hover:bg-slate-50 rounded-lg"
                  >
                    Medical Safety
                  </a>
                  <a 
                    href="#privacy" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 hover:bg-slate-50 rounded-lg"
                  >
                    Data Privacy
                  </a>
                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <Link 
                      to="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-center text-slate-800 bg-slate-100 rounded-lg font-medium text-xs"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-center text-white bg-slate-900 rounded-lg font-medium text-xs"
                    >
                      Get Started
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
