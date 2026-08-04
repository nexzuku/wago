import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input } from '../components/ui';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.user.profile?.firstName || 'User'}!`);
      
      // Redirect based on role
      if (['admin', 'manager'].includes(data.user.role)) {
        navigate('/dashboard');
      } else {
        navigate('/learn');
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Welcome back
        </h1>
        <p className="text-slate-500 text-sm">
          Sign in to access your enterprise training portal
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          autoComplete="email"
          icon={Mail}
          required
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              placeholder="••••••••"
              autoComplete="current-password"
              icon={Lock}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center pt-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
            <span className="text-sm text-slate-600">Remember this device</span>
          </label>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full mt-4"
        >
          Sign in to WaGo
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-500">
          Not part of a company yet?{' '}
          <Link to="/onboarding" className="text-primary-600 hover:text-primary-700 font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
