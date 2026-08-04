import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
  secondary: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300',
  ghost: 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  accent: 'bg-slate-900 text-white hover:bg-slate-800',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 gap-2',
  lg: 'px-8 py-4 text-lg gap-2',
  icon: 'p-2.5',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className,
  as: Component = 'button',
  animate = true,
  ...props
}, ref) => {
  const Wrapper = animate ? motion.button : Component;
  const animationProps = animate ? {
    whileHover: { scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 },
    whileTap: { scale: disabled ? 1 : 0.98 },
    transition: { duration: 0.15 }
  } : {};

  return (
    <Wrapper
      ref={ref}
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary-500',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
      {...animationProps}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{typeof children === 'string' ? 'Loading...' : children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </Wrapper>
  );
});

Button.displayName = 'Button';

export default Button;
