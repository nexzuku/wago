import clsx from 'clsx';

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  className,
  gradient = true,
}) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={clsx(
          'rounded-full object-cover ring-2 ring-slate-100',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center font-medium text-white',
        gradient
          ? 'bg-primary-600'
          : 'bg-slate-200 text-slate-600',
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
};

export default Avatar;
