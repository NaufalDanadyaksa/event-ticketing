import React from 'react';
import {
  Ticket,
  CalendarDays,
  MapPin,
  User,
  Mail,
  Phone,
  QrCode,
  ShieldCheck,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  RegistrationStatus,
  CheckInStatus,
  AttendanceStatus,
} from 'shared';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export interface TicketCardProps {
  ticketCode?: string | null;
  eventTitle: string;
  eventStartDate?: Date | string;
  eventEndDate?: Date | string;
  eventLocation?: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  status: RegistrationStatus;
  checkInStatus?: CheckInStatus;
  checkedInAt?: Date | string | null;
  attendanceStatus?: AttendanceStatus;
  attendedAt?: Date | string | null;
  attendanceEnabled?: boolean;
  onScanAttendance?: () => void;
  className?: string;
}

const formatDate = (dateValue?: Date | string) => {
  if (!dateValue) return '-';
  const d = new Date(dateValue);
  return d.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const TicketCard: React.FC<TicketCardProps> = ({
  ticketCode,
  eventTitle,
  eventStartDate,
  eventEndDate,
  eventLocation,
  attendeeName,
  attendeeEmail,
  attendeePhone,
  status,
  checkInStatus,
  checkedInAt,
  attendanceStatus,
  attendedAt,
  attendanceEnabled = true,
  onScanAttendance,
  className = '',
}) => {
  const isConfirmed = status === RegistrationStatus.CONFIRMED;
  const isCheckedIn = checkInStatus === CheckInStatus.CHECKED_IN;
  const isAttended = attendanceStatus === AttendanceStatus.ATTENDED;

  return (
    <div
      className={`ticket-card bg-white rounded-3xl shadow-lg border border-blue-200/50 overflow-hidden max-w-md w-full mx-auto ${className}`}
    >
      {/* Top Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-6 text-white relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100 flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5" />
            Tiket Masuk Resmi
          </span>
          <Badge status={status} />
        </div>

        <h3 className="text-xl font-extrabold text-white tracking-tight leading-tight mb-2">
          {eventTitle}
        </h3>

        <div className="flex flex-col gap-1.5 text-xs text-blue-50">
          {eventStartDate && (
            <div className="flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 shrink-0 text-blue-200" />
              <span>
                {formatDate(eventStartDate)}
                {eventEndDate ? ` - ${formatDate(eventEndDate)}` : ''}
              </span>
            </div>
          )}

          {eventLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-200" />
              <span>{eventLocation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Perforated Divider with Semicircular Holes */}
      <div className="relative flex items-center bg-white px-4 py-1">
        <div className="w-5 h-5 -ml-6 rounded-full bg-slate-100 border-r border-blue-200/50 shadow-inner" />
        <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
        <div className="w-5 h-5 -mr-6 rounded-full bg-slate-100 border-l border-blue-200/50 shadow-inner" />
      </div>

      {/* Ticket Body Details */}
      <div className="p-6 bg-white flex flex-col gap-5">
        {/* Ticket Code Display */}
        {status === RegistrationStatus.REJECTED ? (
          <div className="flex flex-col items-center justify-center p-4 bg-rose-50/70 border border-rose-200/70 rounded-2xl text-center gap-1.5">
            <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Pendaftaran Ditolak</span>
            </div>
            <p className="text-[11px] text-rose-700">
              Bukti pembayaran tidak valid atau telah ditolak. Tiket tidak dapat diterbitkan.
            </p>
          </div>
        ) : isConfirmed && ticketCode ? (
          <div className="flex flex-col items-center justify-center p-4 bg-blue-50/70 border border-blue-200/60 rounded-2xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">
              Kode Tiket Anda
            </span>
            <div className="font-mono text-xl font-extrabold tracking-widest text-slate-900 select-all">
              {ticketCode}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 bg-amber-50/70 border border-amber-200/70 rounded-2xl text-center gap-1.5">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Menunggu Konfirmasi Pembayaran</span>
            </div>
            <p className="text-[11px] text-amber-700">
              Kode tiket dan QR check-in resmi akan diterbitkan setelah pembayaran diverifikasi oleh admin.
            </p>
          </div>
        )}

        {/* Attendee Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Nama Peserta
            </span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {attendeeName}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Email
            </span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{attendeeEmail}</span>
            </span>
          </div>

          {attendeePhone && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Nomor Telepon
              </span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {attendeePhone}
              </span>
            </div>
          )}
        </div>

        {/* Status Verification Badges */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          {checkInStatus && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Gate:</span>
              <Badge status={checkInStatus} />
              {isCheckedIn && checkedInAt && (
                <span className="text-[11px] text-slate-400">
                  {formatDate(checkedInAt)}
                </span>
              )}
            </div>
          )}

          {attendanceStatus && attendanceEnabled && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Kehadiran:</span>
              <Badge status={attendanceStatus} />
              {isAttended && attendedAt && (
                <span className="text-[11px] text-slate-400">
                  {formatDate(attendedAt)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Live Attendance Action Button */}
        {attendanceEnabled && isConfirmed && onScanAttendance && !isAttended && (
          <div className="pt-2 print:hidden">
            <Button
              variant="primary"
              size="md"
              onClick={onScanAttendance}
              leftIcon={<QrCode className="w-4 h-4" />}
              className="w-full"
            >
              Scan Presensi QR Venue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
