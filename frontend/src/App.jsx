import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import useAuthStore from './store/authStore';

// Layouts
import AuthLayout from './components/auth/AuthLayout';
import DashboardLayout from './components/dashboard/DashboardLayout';
import UserLayout from './components/user/UserLayout';

// Landing and Login stay eager — they are the first paint for signed-out users,
// so lazy-loading them would only add a round trip.
import Landing from './pages/Landing';
import Login from './pages/Login';

// Everything else is split per route: an employee should not download the
// admin dashboard, and vice versa.
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

// Admin Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Employees = lazy(() => import('./pages/Employees'));
const VoiceManagement = lazy(() => import('./pages/VoiceManagement'));
const ContentManagement = lazy(() => import('./pages/ContentManagement'));
const Settings = lazy(() => import('./pages/Settings'));
const CultureManagement = lazy(() => import('./pages/CultureManagement'));
const LearningPathsManagement = lazy(() => import('./pages/LearningPathsManagement'));
const ScenariosManagement = lazy(() => import('./pages/ScenariosManagement'));
const TopicManagement = lazy(() => import('./pages/TopicManagement'));
const Analytics = lazy(() => import('./pages/Analytics'));

// User (Employee) Pages
const LearnPage = lazy(() => import('./pages/user/LearnPage'));
const CulturePage = lazy(() => import('./pages/user/CulturePage'));
const ScenariosPage = lazy(() => import('./pages/user/ScenariosPage'));
const PathsPage = lazy(() => import('./pages/user/PathsPage'));
const ProgressPage = lazy(() => import('./pages/user/ProgressPage'));

// Protected Route Component
const RouteSpinner = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <RouteSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/learn" replace />;
  }

  return children;
};

const hexToRgb = (hex) => {
  const value = hex.replace('#', '').trim();
  if (value.length === 3) {
    const r = parseInt(value[0] + value[0], 16);
    const g = parseInt(value[1] + value[1], 16);
    const b = parseInt(value[2] + value[2], 16);
    return { r, g, b };
  }
  if (value.length === 6) {
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
};

const rgbToHsl = ({ r, g, b }) => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn:
        h = ((gn - bn) / d) % 6;
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
        break;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return { h, s, l };
};

const hslToRgb = ({ h, s, l }) => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hh = h / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  const m = l - c / 2;

  let rn = 0;
  let gn = 0;
  let bn = 0;

  if (hh >= 0 && hh < 1) {
    rn = c; gn = x; bn = 0;
  } else if (hh >= 1 && hh < 2) {
    rn = x; gn = c; bn = 0;
  } else if (hh >= 2 && hh < 3) {
    rn = 0; gn = c; bn = x;
  } else if (hh >= 3 && hh < 4) {
    rn = 0; gn = x; bn = c;
  } else if (hh >= 4 && hh < 5) {
    rn = x; gn = 0; bn = c;
  } else {
    rn = c; gn = 0; bn = x;
  }

  return {
    r: Math.round((rn + m) * 255),
    g: Math.round((gn + m) * 255),
    b: Math.round((bn + m) * 255),
  };
};

const pickThemeBaseColor = (industry) => {
  const value = (industry || '').toLowerCase();
  if (!value) return '#0891b2';

  if (value.includes('construction') || value.includes('real estate') || value.includes('infrastructure')) return '#b45309';
  if (value.includes('manufacturing') || value.includes('factory') || value.includes('automotive') || value.includes('industrial')) return '#1d4ed8';
  if (value.includes('health') || value.includes('medical') || value.includes('hospital') || value.includes('pharma')) return '#059669';
  if (value.includes('restaurant') || value.includes('food') || value.includes('hospitality') || value.includes('hotel')) return '#be123c';
  if (value.includes('finance') || value.includes('bank') || value.includes('insurance')) return '#0f172a';
  if (value.includes('retail') || value.includes('ecommerce') || value.includes('consumer')) return '#7c3aed';
  if (value.includes('logistics') || value.includes('shipping') || value.includes('transport')) return '#0e7490';
  if (value.includes('education') || value.includes('training')) return '#4f46e5';
  if (value.includes('tech') || value.includes('software') || value.includes('it')) return '#0891b2';

  return '#0891b2';
};

const applyPrimaryPalette = (baseHex) => {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return;

  const hsl = rgbToHsl(rgb);
  const baseL = hsl.l;

  const shadeLightness = {
    50: Math.min(0.98, baseL + 0.46),
    100: Math.min(0.95, baseL + 0.40),
    200: Math.min(0.90, baseL + 0.32),
    300: Math.min(0.84, baseL + 0.22),
    400: Math.min(0.76, baseL + 0.12),
    500: Math.min(0.68, baseL + 0.06),
    600: baseL,
    700: Math.max(0.16, baseL - 0.08),
    800: Math.max(0.12, baseL - 0.16),
    900: Math.max(0.10, baseL - 0.24),
    950: Math.max(0.08, baseL - 0.32),
  };

  const root = document.documentElement;
  Object.entries(shadeLightness).forEach(([shade, l]) => {
    const { r, g, b } = hslToRgb({ h: hsl.h, s: Math.min(1, hsl.s), l });
    root.style.setProperty(`--primary-${shade}`, `${r} ${g} ${b}`);
  });
};

const FallbackRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (['admin', 'manager'].includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/learn" replace />;
};

function App() {
  const { initialize, isLoading, company } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const baseHex = company?.primaryColor || pickThemeBaseColor(company?.industry);
    applyPrimaryPalette(baseHex);
  }, [company?.primaryColor, company?.industry]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Initializing platform...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<RouteSpinner />}>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>

      {/* Admin/Manager Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute roles={['admin', 'manager']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/voice" element={<VoiceManagement />} />
        <Route path="/content" element={<ContentManagement />} />
        <Route path="/admin/culture" element={<CultureManagement />} />
        <Route path="/admin/paths" element={<LearningPathsManagement />} />
        <Route path="/admin/scenarios" element={<ScenariosManagement />} />
        <Route path="/admin/topics" element={<TopicManagement />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Employee / User-Facing Training Routes */}
      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/culture" element={<CulturePage />} />
        <Route path="/scenarios" element={<ScenariosPage />} />
        <Route path="/paths" element={<PathsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
      </Route>

      {/* Legacy training redirect */}
      <Route path="/training" element={<Navigate to="/learn" replace />} />

      {/* Fallback - redirect based on auth state */}
      <Route path="*" element={<FallbackRedirect />} />
    </Routes>
    </Suspense>
  );
}

export default App;
