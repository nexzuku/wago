import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export const useAuth = (options = {}) => {
  const { requireAuth = false, requireRole = null, redirectTo = '/login' } = options;
  const navigate = useNavigate();
  const { user, company, isAuthenticated, isLoading, initialize, login, logout, register } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      navigate(redirectTo);
      return;
    }

    if (requireRole && user) {
      const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
      if (!roles.includes(user.role)) {
        navigate('/unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requireRole, navigate, redirectTo]);

  return {
    user,
    company,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    isAdmin: user?.role === 'admin',
    isManager: ['admin', 'manager'].includes(user?.role),
    isEmployee: user?.role === 'employee'
  };
};

export default useAuth;
