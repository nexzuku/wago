import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Mic2, 
  FolderOpen, 
  Settings, 
  LogOut,
  GraduationCap,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Landmark,
  Route,
  Briefcase,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { Avatar } from '../ui';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/employees', icon: Users, label: 'Employees' },
  { path: '/admin/topics', icon: BookOpen, label: 'Topics & Phrases' },
  { path: '/voice', icon: Mic2, label: 'Voice Management' },
  { path: '/content', icon: FolderOpen, label: 'Content' },
  { path: '/admin/culture', icon: Landmark, label: 'Culture' },
  { path: '/admin/paths', icon: Route, label: 'Learning Paths' },
  { path: '/admin/scenarios', icon: Briefcase, label: 'Scenarios' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Reports & Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, company, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Sidebar - Dark theme for visual hierarchy */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-display font-bold text-slate-900 text-sm">
                和
              </div>
              <div className="min-w-0">
                <h1 className="font-display font-bold text-white text-base tracking-tight">WaGo<span className="text-primary-500">.</span></h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[140px]">
                  {company?.name || 'Enterprise'}
                </p>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <p className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Platform</p>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 text-sm font-medium ${
                    isActive 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-4.5 h-4.5" />
                <span>{item.label}</span>
              </NavLink>
            ))}

            <div className="pt-6 mt-6 border-t border-slate-800">
              <p className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Quick Access</p>
              <NavLink
                to="/learn"
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-primary-400 hover:text-primary-300 hover:bg-primary-400/10 transition-all duration-150 text-sm font-medium"
                onClick={() => setSidebarOpen(false)}
              >
                <GraduationCap className="w-4.5 h-4.5" />
                <span>Switch to Training</span>
              </NavLink>
            </div>
          </nav>

          {/* User Profile & Footer */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group mb-2">
              <Avatar 
                name={user?.profile?.firstName || user?.email}
                size="sm"
                className="ring-2 ring-slate-800 group-hover:ring-slate-700"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs truncate">
                  {user?.profile?.firstName || 'User'}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{user?.role || 'Member'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 text-xs font-bold uppercase tracking-wider"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-50"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Global Search */}
            <div className="hidden sm:flex flex-1 max-w-md ml-4 lg:ml-0">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search platform..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3 ml-auto">
              <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button>
              
              <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />
              
              <div className="flex items-center gap-3 pl-1">
                <div className="text-right hidden md:block">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">Organization</p>
                  <p className="text-[10px] font-medium text-slate-500">{company?.name || 'Standard Plan'}</p>
                </div>
                <Avatar 
                  name={company?.name || 'Company'} 
                  size="sm" 
                  className="bg-primary-50 text-primary-700 font-bold"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-transparent">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
