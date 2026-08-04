import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../ui';

const AuthLayout = () => {
  const location = useLocation();
  const isOnboarding = location.pathname === '/onboarding';

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden flex flex-col">
      {/* Background Subtle Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-[120px] -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-200/50 rounded-full blur-[100px] -ml-20 -mb-20" />
      </div>

      {/* Header */}
      <header className={`relative z-10 ${isOnboarding ? 'p-4 md:p-6' : 'p-6 md:p-8'}`}>
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center font-display font-bold text-white text-base">
              和
            </div>
            <span className="font-display font-bold text-xl text-slate-900 tracking-tight">
              WaGo<span className="text-primary-600">.</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`relative z-10 flex-1 flex justify-center ${
          isOnboarding ? 'items-start p-4 md:p-6 pt-0' : 'items-center p-6 md:p-8'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`w-full ${isOnboarding ? 'max-w-6xl' : 'max-w-[420px]'}`}
        >
          {isOnboarding ? (
            <Outlet />
          ) : (
            <Card padding="none" className="shadow-xl shadow-slate-200/50">
              <Outlet />
            </Card>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
          © {new Date().getFullYear()} WaGo Enterprise Japanese. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AuthLayout;
