import { Outlet, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Flame, 
  Star, 
  Target, 
  BookOpen, 
  MessageCircle, 
  Trophy,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const TrainingLayout = () => {
  const { user, logout, isAdmin, isManager } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-display font-bold text-white text-xs">
                和
              </div>
              <span className="font-display font-bold text-lg text-slate-900 tracking-tight hidden sm:block">
                WaGo<span className="text-primary-600">.</span>
              </span>
            </Link>
          </div>

          {/* User Stats - Professional Pill Style */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider pr-3 border-r border-slate-200">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>{user?.progress?.currentStreak || 0} Day Streak</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 border-r border-slate-200">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>{user?.stars || 0} Stars</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-3">
              <Target className="w-3.5 h-3.5 text-primary-600" />
              <span>{user?.progress?.skills?.pronunciation || 0}% Accuracy</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {(isAdmin || isManager) && (
              <Link
                to="/dashboard"
                className="p-2 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                title="Dashboard"
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Bottom Navigation - Dark Contrast Theme */}
      <nav className="sticky bottom-0 bg-slate-900 text-white safe-area-pb shadow-2xl shadow-black/20">
        <div className="max-w-md mx-auto flex items-center justify-around h-16">
          <NavButton icon={Home} label="Home" active />
          <NavButton icon={BookOpen} label="Learn" />
          <NavButton icon={MessageCircle} label="Talk" />
          <NavButton icon={Trophy} label="Progress" />
        </div>
      </nav>
    </div>
  );
};

const NavButton = ({ icon: Icon, label, active = false }) => (
  <button
    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
      active 
        ? 'text-primary-400 scale-110' 
        : 'text-slate-400 hover:text-white'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export default TrainingLayout;
