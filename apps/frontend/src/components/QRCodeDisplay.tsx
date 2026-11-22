import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode } from 'lucide-react';

export interface QRCodeDisplayProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  subLabel?: string;
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 200,
  level = 'M',
  includeMargin = true,
  subLabel,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="p-4 bg-white rounded-2xl border-2 border-blue-200/60 shadow-md inline-flex items-center justify-center transition-transform hover:scale-[1.02]">
        <QRCodeSVG
          value={value}
          size={size}
          level={level}
          includeMargin={includeMargin}
          fgColor="#0F172A"
          bgColor="#FFFFFF"
        />
      </div>

      {subLabel && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <QrCode className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>{subLabel}</span>
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;
