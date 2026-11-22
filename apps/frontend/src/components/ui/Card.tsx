import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'gradient';
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<NonNullable<CardProps['variant']>, string> = {
  glass:
    'bg-white/65 backdrop-blur-md border border-blue-200/40 rounded-3xl shadow-card',
  solid:
    'bg-white border border-slate-200 rounded-2xl shadow-sm',
  gradient:
    'bg-gradient-to-br from-white/80 via-blue-50/60 to-sky-100/50 backdrop-blur-md border border-blue-200/50 rounded-3xl shadow-card',
};

export const Card: React.FC<CardProps> = ({
  variant = 'glass',
  children,
  className = '',
  ...rest
}) => {
  return (
    <div className={`${variantStyles[variant]} ${className}`} {...rest}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => {
  return (
    <div
      className={`px-6 py-5 border-b border-blue-100/50 flex flex-col gap-1 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...rest
}) => {
  return (
    <h3
      className={`text-lg font-bold text-slate-900 tracking-tight ${className}`}
      {...rest}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...rest
}) => {
  return (
    <p className={`text-xs text-slate-500 leading-relaxed ${className}`} {...rest}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => {
  return (
    <div className={`p-6 ${className}`} {...rest}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => {
  return (
    <div
      className={`px-6 py-4 bg-slate-50/50 border-t border-blue-100/50 rounded-b-3xl flex items-center justify-between gap-3 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
