import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Card = forwardRef(({
  children,
  className,
  hover = false,
  gradient = false,
  padding = 'md',
  animate = false,
  delay = 0,
  variant = 'default',
  ...props
}, ref) => {
  const Wrapper = animate ? motion.div : 'div';

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'bg-white/90 backdrop-blur-sm border border-slate-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)]',
    dark: 'bg-slate-900/95 border border-slate-800 text-white shadow-2xl',
    ghost: 'bg-transparent border-0 shadow-none',
    glass: 'bg-white/80 backdrop-blur-xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
  };

  const gradientClasses = gradient
    ? variant === 'dark'
      ? 'relative isolate before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-primary-500/10 before:via-transparent before:to-transparent'
      : 'relative isolate before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-primary-50/60 before:via-white/40 before:to-transparent'
    : '';

  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }
  } : {};

  return (
    <Wrapper
      ref={ref}
      className={clsx(
        variantClasses[variant] || variantClasses.default,
        'rounded-2xl overflow-hidden',
        hover && 'transition-all duration-300 hover:border-primary-300/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 cursor-pointer',
        gradientClasses,
        paddingClasses[padding],
        className
      )}
      {...animationProps}
      {...props}
    >
      {children}
    </Wrapper>
  );
});

Card.displayName = 'Card';

export default Card;
