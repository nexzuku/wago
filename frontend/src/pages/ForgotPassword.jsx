import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { Button, Input } from '../components/ui';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      // Still show success to prevent email enumeration
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
          Check your email
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          If an account exists for <strong className="text-slate-900">{email}</strong>, 
          you'll receive password reset instructions.
        </p>

        <Link to="/login">
          <Button variant="secondary" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Reset password
        </h1>
        <p className="text-slate-500 text-sm">
          Enter your email and we'll send you reset instructions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full mt-4"
        >
          Send Reset Link
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
