import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Landmark,
  Briefcase,
  Route,
  Trophy,
  Bell,
  User,
  Settings,
  Award,
  LogOut,
  Clock,
  LayoutDashboard,
  AlertTriangle,
  X,
  Volume2,
  Flame,
  Star,
  Zap,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { phrasesAPI, speechAPI } from '../../services/api';

const fallbackEmergency = [
  { id: 'help', icon: '🆘', en: 'HELP!', jp: '助けて！', rom: 'Tasukete!' },
  { id: 'doctor', icon: '🏥', en: 'Call Doctor', jp: '医者を呼んで', rom: 'Isha wo yonde' },
  { id: 'hurt', icon: '🤕', en: "I'm hurt", jp: '怪我をしました', rom: 'Kega wo shimashita' },
  { id: 'ambulance', icon: '🚑', en: 'Call Ambulance', jp: '救急車を呼んで', rom: 'Kyuukyuusha wo yonde' },
  { id: 'fire', icon: '🔥', en: 'FIRE!', jp: '火事だ！', rom: 'Kaji da!' },
  { id: 'stop', icon: '🛑', en: 'STOP!', jp: '止まって！', rom: 'Tomatte!' },
];

const navItems = [
  { path: '/learn', icon: GraduationCap, label: 'Learn', desc: 'Practice phrases' },
  { path: '/culture', icon: Landmark, label: 'Culture', desc: 'Etiquette & customs' },
  { path: '/scenarios', icon: Briefcase, label: 'Work', desc: 'Workplace scenarios' },
  { path: '/paths', icon: Route, label: 'Paths', desc: 'Learning journeys' },
  { path: '/progress', icon: Trophy, label: 'Progress', desc: 'Your stats' },
];

const UserLayout = () => {
  const { user, company, logout, isAdmin, isManager } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSOS, setShowSOS] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [emergencyItems, setEmergencyItems] = useState([]);
  const [isEmergencyLoading, setIsEmergencyLoading] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setSessionTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadEmergencyPhrases();
  }, []);

  const loadEmergencyPhrases = async () => {
    setIsEmergencyLoading(true);
    try {
      const { data } = await phrasesAPI.getEmergency();
      const phrases = data.data || [];
      const categoryIcons = { medical: '🏥', safety: '⚠️', help: '🆘' };
      const mapped = phrases.map((phrase) => ({
        id: phrase._id,
        icon: categoryIcons[phrase.emergencyCategory] || '🚨',
        en: phrase.english || 'Emergency',
        jp: phrase.japanese,
        rom: phrase.romaji,
        audioUrl: phrase.audioUrl
      }));
      setEmergencyItems(mapped.length > 0 ? mapped : fallbackEmergency);
    } catch {
      setEmergencyItems(fallbackEmergency);
    } finally {
      setIsEmergencyLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const streak = user?.progress?.currentStreak || 0;
  const stars = user?.stars || 0;

  const activeNav = navItems.find(item =>
    location.pathname === item.path || (item.path === '/learn' && location.pathname.startsWith('/learn'))
  );

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'linear-gradient(165deg, #0c0f1a 0%, #111827 40%, #0f172a 100%)' }}>

      {/* ─── Desktop Sidebar (lg+) ─── */}
      <aside className={`hidden lg:flex flex-col flex-shrink-0 relative z-50 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'}`}>
        <div className="absolute inset-0 border-r border-white/[0.06]" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.6), rgba(15,23,42,0.95))' }} />

        <div className="relative flex flex-col h-full">
          {/* Sidebar Header */}
          <div className={`flex items-center h-16 px-4 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-600/20 flex-shrink-0">
                <span className="font-japanese font-bold text-white text-sm">和</span>
              </div>
              {!sidebarCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <span className="font-display font-bold text-[15px] text-white tracking-tight">WaGo</span>
                  <span className="text-primary-400 font-display font-bold">.</span>
                </motion.div>
              )}
            </div>
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Gamification Stats */}
          {!sidebarCollapsed && (
            <div className="mx-3 mb-4 p-3 rounded-xl border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-xs font-bold text-orange-300">{streak}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">{stars}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono text-[10px] tabular-nums">{formatTime(sessionTime)}</span>
                </div>
              </div>
            </div>
          )}

          {sidebarCollapsed && (
            <div className="flex flex-col items-center gap-1 mb-4 px-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10">
                <Flame className="w-3 h-3 text-orange-400" />
                <span className="text-[10px] font-bold text-orange-300">{streak}</span>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path === '/learn' && location.pathname.startsWith('/learn'));
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  whileTap={{ scale: 0.97 }}
                  className={`relative w-full flex items-center gap-3 rounded-xl transition-all duration-200 ${
                    sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'
                  } ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl border border-primary-500/20"
                      style={{ background: 'linear-gradient(135deg, rgba(var(--primary-600), 0.15), rgba(var(--primary-500), 0.05))' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className={`w-5 h-5 relative z-10 flex-shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
                  {!sidebarCollapsed && (
                    <div className="relative z-10 text-left">
                      <span className={`text-sm font-semibold block leading-tight ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                      <span className="text-[10px] text-slate-500 leading-tight">{item.desc}</span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* SOS Button in Sidebar */}
          <div className={`px-2 mb-3 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
            <button
              onClick={() => setShowSOS(true)}
              className={`flex items-center gap-2 rounded-xl font-bold text-xs transition-all border border-rose-500/20 hover:border-rose-500/40 ${
                sidebarCollapsed ? 'p-3 justify-center' : 'w-full px-3 py-2.5'
              }`}
              style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))' }}
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-rose-300">Emergency SOS</span>}
            </button>
          </div>

          {/* Collapse Toggle (when collapsed) */}
          {sidebarCollapsed && (
            <div className="px-2 mb-3 flex justify-center">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* User Profile Section */}
          <div className={`border-t border-white/[0.06] ${sidebarCollapsed ? 'p-2' : 'p-3'}`} ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={`w-full flex items-center gap-3 rounded-xl hover:bg-white/[0.04] transition-all ${
                sidebarCollapsed ? 'justify-center p-2' : 'p-2'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/30 to-primary-600/30 border border-primary-500/30 flex items-center justify-center text-primary-300 flex-shrink-0">
                <span className="text-xs font-bold">{user?.profile?.firstName?.[0] || 'U'}</span>
              </div>
              {!sidebarCollapsed && (
                <div className="text-left min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.profile?.firstName} {user?.profile?.lastName}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{company?.name}</p>
                </div>
              )}
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute bottom-full mb-2 w-64 rounded-2xl overflow-hidden z-50 border border-white/10 ${
                    sidebarCollapsed ? 'left-2' : 'left-3'
                  }`}
                  style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98))', backdropFilter: 'blur(20px)' }}
                >
                  <div className="p-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-600/20">
                        {user?.profile?.firstName?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-white text-sm truncate">
                          {user?.profile?.firstName} {user?.profile?.lastName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{company?.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-1.5">
                    {(isAdmin() || isManager()) && (
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" /> Admin Panel
                      </button>
                    )}
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all">
                      <Settings className="w-4 h-4 text-slate-500" /> Settings
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all">
                      <Award className="w-4 h-4 text-slate-500" /> Achievements
                    </button>
                    <div className="my-1 border-t border-white/[0.06]" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ─── Mobile/Tablet Header ─── */}
        <header className="lg:hidden flex-shrink-0 relative z-50">
          <div className="absolute inset-0 border-b border-white/[0.06]" style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.95), rgba(15,23,42,0.9))', backdropFilter: 'blur(20px)' }} />
          <div className="relative px-4 h-14 flex items-center justify-between">
            {/* Left: Brand + Menu */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-600/20">
                  <span className="font-japanese font-bold text-white text-xs">和</span>
                </div>
                <div>
                  <span className="font-display font-bold text-sm text-white tracking-tight">WaGo</span>
                  <span className="text-primary-400 font-display font-bold">.</span>
                </div>
              </div>
            </div>

            {/* Center: Current Page */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <span className="text-sm font-semibold text-white">{activeNav?.label || 'Learn'}</span>
            </div>

            {/* Right: Quick Stats + Profile */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10">
                <Flame className="w-3 h-3 text-orange-400" />
                <span className="text-[10px] font-bold text-orange-300">{streak}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10">
                <Star className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-300">{stars}</span>
              </div>
              <div className="relative" ref={!sidebarCollapsed ? undefined : profileRef}>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-300"
                >
                  <span className="text-xs font-bold">{user?.profile?.firstName?.[0] || 'U'}</span>
                </button>

                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50 border border-white/10 lg:hidden"
                      style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98))', backdropFilter: 'blur(20px)' }}
                    >
                      <div className="p-4 border-b border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                            {user?.profile?.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-display font-semibold text-white text-sm">
                              {user?.profile?.firstName} {user?.profile?.lastName}
                            </p>
                            <p className="text-xs text-slate-400">{company?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.06] text-xs">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span className="font-mono text-[10px] text-slate-400 tabular-nums">{formatTime(sessionTime)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-1.5">
                        {(isAdmin() || isManager()) && (
                          <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-500" /> Admin Panel
                          </button>
                        )}
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all">
                          <Settings className="w-4 h-4 text-slate-500" /> Settings
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all">
                          <Award className="w-4 h-4 text-slate-500" /> Achievements
                        </button>
                        <div className="my-1 border-t border-white/[0.06]" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <LogOut className="w-4 h-4" /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Main Content ─── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-600/[0.03] rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-violet-600/[0.02] rounded-full blur-3xl" />
          </div>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full relative z-10"
          >
            <Outlet />
          </motion.div>

          {/* SOS Floating Button - Mobile only (sidebar has it on desktop) */}
          <motion.button
            onClick={() => setShowSOS(true)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="lg:hidden fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(239,68,68,0.35), 0 0 0 1px rgba(255,255,255,0.1) inset'
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            SOS
          </motion.button>
        </main>

        {/* ─── Mobile/Tablet Bottom Navigation ─── */}
        <nav className="lg:hidden flex-shrink-0 safe-area-pb z-40 relative">
          <div className="absolute inset-0 border-t border-white/[0.06]" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.98), rgba(15,23,42,0.92))', backdropFilter: 'blur(20px)' }} />
          <div className="relative max-w-lg mx-auto flex items-center justify-around h-16 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path === '/learn' && location.pathname.startsWith('/learn'));
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  whileTap={{ scale: 0.9 }}
                  className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 ${
                    isActive ? '' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: 'linear-gradient(135deg, rgba(var(--primary-600), 0.15), rgba(var(--primary-500), 0.05))' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-primary-400 stroke-[2.5]' : ''}`} />
                  <span className={`text-[9px] font-bold uppercase tracking-[0.06em] relative z-10 transition-colors ${isActive ? 'text-primary-300' : ''}`}>
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ─── Emergency SOS Overlay ─── */}
      <AnimatePresence>
        {showSOS && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col"
            style={{ background: 'linear-gradient(180deg, rgba(127,29,29,0.95) 0%, rgba(15,23,42,0.98) 100%)' }}
          >
            <div className="flex items-center justify-between px-5 py-5">
              <div />
              <h2 className="text-white font-display font-bold text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </span>
                Emergency Phrases
              </h2>
              <button
                onClick={() => setShowSOS(false)}
                className="p-2.5 text-white/40 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-8">
              {isEmergencyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-rose-400 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                  {(emergencyItems.length > 0 ? emergencyItems : fallbackEmergency).map((phrase, i) => (
                    <motion.div
                      key={phrase.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <EmergencyCard phrase={phrase} />
                    </motion.div>
                  ))}
                </div>
              )}
              <p className="text-center text-white/30 text-xs mt-8 flex items-center justify-center gap-2">
                <Volume2 className="w-3 h-3" />
                Tap any phrase to hear pronunciation
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EmergencyCard = ({ phrase }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      let audioUrl = phrase.audioUrl;
      if (!audioUrl) {
        const { data } = await speechAPI.textToSpeech(phrase.jp);
        audioUrl = data.data?.url || data.data?.audioUrl;
      }
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlaying(false);
        audio.play();
      } else {
        setIsPlaying(false);
      }
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={handlePlay}
      className={`w-full rounded-2xl p-4 text-left transition-all active:scale-[0.97] border ${
        isPlaying
          ? 'bg-white/[0.12] border-rose-400/40 shadow-lg shadow-rose-500/10'
          : 'bg-white/[0.06] border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.12]'
      }`}
    >
      <div className="text-2xl mb-2">{phrase.icon}</div>
      <div className="text-white font-display font-bold text-sm mb-1">{phrase.en}</div>
      <div className="text-white/90 font-japanese text-lg font-bold leading-tight">{phrase.jp}</div>
      <div className="text-white/40 text-[11px] mt-1 font-body">{phrase.rom}</div>
    </button>
  );
};

export default UserLayout;
