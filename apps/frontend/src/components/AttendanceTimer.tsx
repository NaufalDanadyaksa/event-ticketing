import React, { useEffect, useState } from 'react';
import { Timer, Clock, RefreshCw } from 'lucide-react';

export interface AttendanceTimerProps {
  durationSeconds?: number;
  onExpire?: () => void;
  resetKey?: string | number;
  className?: string;
  showTimeText?: boolean;
}

export const AttendanceTimer: React.FC<AttendanceTimerProps> = ({
  durationSeconds = 10,
  onExpire,
  resetKey,
  className = '',
  showTimeText = true,
}) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    setTimeLeft(durationSeconds);
  }, [resetKey, durationSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) {
        onExpire();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, prev - 0.1);
        return Math.round(next * 10) / 10;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [timeLeft, onExpire]);

  const percentage = Math.max(0, Math.min(100, (timeLeft / durationSeconds) * 100));

  // Determine color based on time left
  const getProgressColor = () => {
    if (percentage > 50) return 'bg-gradient-to-r from-blue-500 to-sky-400';
    if (percentage > 20) return 'bg-gradient-to-r from-amber-500 to-yellow-400';
    return 'bg-gradient-to-r from-rose-500 to-red-400';
  };

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      {/* Header with Icon and Seconds Text */}
      {showTimeText && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1.5 text-blue-700">
            <Timer className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>Rotasi Kode QR Dinamis</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600 font-mono text-sm">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-800">{timeLeft.toFixed(1)}s</span>
          </div>
        </div>
      )}

      {/* Progress Track and Animated Bar */}
      <div className="w-full h-2.5 bg-blue-100/80 rounded-full overflow-hidden p-0.5 border border-blue-200/50">
        <div
          className={`h-full rounded-full transition-all duration-100 ease-linear ${getProgressColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default AttendanceTimer;
