import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { Button, Input } from '../components/ui';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.resetPassword(token, password);
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="p-8 md:p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Invalid Link
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          This password reset link is invalid or has expired.
        </p>
        <Link to="/forgot-password">
          <Button className="w-full">
            Request New Link
          </Button>
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="p-8 md:p-10 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </motion.div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Password reset!
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          Your password has been successfully reset. Redirecting to login...
        </p>
        
        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="p-8 md:p-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Create new password
        </h1>
        <p className="text-slate-500 text-sm">
          Please enter your new secure password below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
            placeholder="••••••••"
            icon={Lock}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-600 z-10"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          icon={Lock}
          required
        />

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full mt-4"
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
