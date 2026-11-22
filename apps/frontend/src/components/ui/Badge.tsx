import React from 'react';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  MinusCircle,
  ShieldCheck,
} from 'lucide-react';
import {
  RegistrationStatus,
  CheckInStatus,
  AttendanceStatus,
} from 'shared';

export type BadgeVariant =
  | 'blue'
  | 'sky'
  | 'green'
  | 'yellow'
  | 'red'
  | 'gray'
  | 'purple';

export interface BadgeProps {
  status?: RegistrationStatus | CheckInStatus | AttendanceStatus | string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const sizeStyles: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3.5 py-1.5 text-sm',
};

const variantStyles: Record<BadgeVariant, string> = {
  blue: 'bg-blue-100 text-blue-700 border border-blue-200/60',
  sky: 'bg-sky-100 text-sky-700 border border-sky-200/60',
  green: 'bg-emerald-100 text-emerald-800 border border-emerald-200/60',
  yellow: 'bg-amber-100 text-amber-800 border border-amber-200/60',
  red: 'bg-rose-100 text-rose-800 border border-rose-200/60',
  gray: 'bg-slate-100 text-slate-700 border border-slate-200/60',
  purple: 'bg-violet-100 text-violet-800 border border-violet-200/60',
};

const dotColors: Record<BadgeVariant, string> = {
  blue: 'bg-blue-500',
  sky: 'bg-sky-500',
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-rose-500',
  gray: 'bg-slate-400',
  purple: 'bg-violet-500',
};

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
  icon: React.ReactNode;
}

const resolveStatusConfig = (status: string): StatusConfig => {
  switch (status) {
    case RegistrationStatus.CONFIRMED:
      return {
        label: 'Terkonfirmasi',
        variant: 'green',
        icon: <CheckCircle className="w-3.5 h-3.5" />,
      };
    case RegistrationStatus.PAYMENT_SUBMITTED:
      return {
        label: 'Menunggu Verifikasi',
        variant: 'yellow',
        icon: <Clock className="w-3.5 h-3.5" />,
      };
    case RegistrationStatus.WAITING_PAYMENT:
      return {
        label: 'Menunggu Pembayaran',
        variant: 'blue',
        icon: <Clock className="w-3.5 h-3.5" />,
      };
    case RegistrationStatus.REJECTED:
      return {
        label: 'Ditolak',
        variant: 'red',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
      };
    case RegistrationStatus.CANCELLED:
      return {
        label: 'Dibatalkan',
        variant: 'gray',
        icon: <XCircle className="w-3.5 h-3.5" />,
      };
    case CheckInStatus.CHECKED_IN:
      return {
        label: 'Sudah Check-In',
        variant: 'green',
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
      };
    case CheckInStatus.NOT_CHECKED_IN:
      return {
        label: 'Belum Check-In',
        variant: 'gray',
        icon: <MinusCircle className="w-3.5 h-3.5" />,
      };
    case AttendanceStatus.ATTENDED:
      return {
        label: 'Hadir',
        variant: 'green',
        icon: <CheckCircle className="w-3.5 h-3.5" />,
      };
    case AttendanceStatus.ABSENT:
      return {
        label: 'Tidak Hadir',
        variant: 'gray',
        icon: <MinusCircle className="w-3.5 h-3.5" />,
      };
    default:
      return {
        label: status,
        variant: 'gray',
        icon: null,
      };
  }
};

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant,
  size = 'md',
  dot = false,
  icon,
  children,
  className = '',
}) => {
  let finalVariant: BadgeVariant = variant || 'gray';
  let finalLabel: React.ReactNode = children;
  let finalIcon: React.ReactNode = icon;

  if (status) {
    const config = resolveStatusConfig(status);
    finalVariant = variant || config.variant;
    finalLabel = children || config.label;
    if (icon === undefined) {
      finalIcon = config.icon;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide select-none ${sizeStyles[size]} ${variantStyles[finalVariant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[finalVariant]}`}
        />
      )}
      {finalIcon && <span className="inline-flex shrink-0">{finalIcon}</span>}
      <span>{finalLabel}</span>
    </span>
  );
};

export default Badge;
