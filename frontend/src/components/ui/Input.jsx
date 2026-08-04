import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className,
  containerClassName,
  type = 'text',
  ...props
}, ref) => {
  const isTextarea = type === 'textarea';
  const Component = isTextarea ? 'textarea' : 'input';

  return (
    <div className={clsx('space-y-2', containerClassName)}>
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && !isTextarea && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        )}
        <Component
          ref={ref}
          type={isTextarea ? undefined : type}
          className={clsx(
            'w-full bg-slate-50 border rounded-md text-slate-900 placeholder-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-all duration-150',
            Icon && !isTextarea ? 'pl-9 pr-4 py-2.5' : 'px-4 py-2.5',
            isTextarea && 'min-h-[100px] resize-y px-4 py-3',
            error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1.5">
          <span className="w-1 h-1 rounded-full bg-red-600" />
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
