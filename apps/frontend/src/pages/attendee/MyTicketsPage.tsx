import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ticket,
  CalendarDays,
  MapPin,
  QrCode,
  ExternalLink,
  AlertCircle,
  Clock,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { RegistrationStatus, CheckInStatus, AttendanceStatus } from 'shared';
import { registrationsApi, MyTicketItem } from '@/services/api/registrations.api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

export const MyTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<MyTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'rejected'>('all');

  const fetchMyTickets = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await registrationsApi.getMyTickets();
      setTickets(response.data || []);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Gagal memuat tiket Anda. Silakan coba kembali.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter === 'confirmed') return t.status === RegistrationStatus.CONFIRMED;
      if (statusFilter === 'pending')
        return (
          t.status === RegistrationStatus.WAITING_PAYMENT ||
          t.status === RegistrationStatus.PAYMENT_SUBMITTED
        );
      if (statusFilter === 'rejected') return t.status === RegistrationStatus.REJECTED;
      return true;
    });
  }, [tickets, statusFilter]);

  const formatDate = (dateValue?: Date | string) => {
    if (!dateValue) return '-';
    const d = new Date(dateValue);
    return d.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case RegistrationStatus.CONFIRMED:
        return <Badge variant="green">Terkonfirmasi</Badge>;
      case RegistrationStatus.PAYMENT_SUBMITTED:
        return <Badge variant="yellow">Verifikasi Pembayaran</Badge>;
      case RegistrationStatus.WAITING_PAYMENT:
        return <Badge variant="blue">Menunggu Pembayaran</Badge>;
      case RegistrationStatus.REJECTED:
        return <Badge variant="red">Ditolak</Badge>;
      case RegistrationStatus.CANCELLED:
        return <Badge variant="gray">Dibatalkan</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-blue-200/50">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/20">
              <Ticket className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tiket Saya
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar seluruh e-tiket event yang telah Anda daftarkan beserta status verifikasinya.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex items-center p-1 rounded-full bg-white/80 border border-blue-200/70 shadow-sm self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            Semua ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('confirmed')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === 'confirmed'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            Terkonfirmasi
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === 'pending'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            Menunggu
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('rejected')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === 'rejected'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            Ditolak
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" variant="primary" />
          <p className="text-xs text-slate-500 font-medium">Memuat tiket Anda...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && errorMessage && (
        <div className="max-w-md mx-auto my-12 p-6 bg-red-50/80 border border-red-200 rounded-3xl text-center shadow-card">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-red-700">{errorMessage}</p>
          <Button variant="secondary" size="sm" onClick={fetchMyTickets} className="mt-4">
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMessage && filteredTickets.length === 0 && (
        <div className="max-w-md mx-auto my-16 p-8 text-center bg-white/70 backdrop-blur-md border border-blue-200/50 rounded-3xl shadow-card space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Belum Ada Tiket</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {statusFilter !== 'all'
                ? 'Tidak ada tiket dengan filter status yang dipilih.'
                : 'Anda belum mendaftarkan diri pada event apa pun.'}
            </p>
          </div>
          <Link to="/" className="inline-block pt-2">
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="shadow-md shadow-blue-500/20"
            >
              Jelajahi Event
            </Button>
          </Link>
        </div>
      )}

      {/* Tickets List */}
      {!isLoading && !errorMessage && filteredTickets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
          {filteredTickets.map((ticket) => {
            const event = ticket.event;
            const isCheckedIn = ticket.checkInStatus === CheckInStatus.CHECKED_IN;
            const isAttended = ticket.attendanceStatus === AttendanceStatus.ATTENDED;

            return (
              <div
                key={ticket.id}
                className="bg-white/80 backdrop-blur-md border border-blue-200/60 rounded-3xl p-6 shadow-card hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between gap-6"
              >
                {/* Top Section: Status Badges & Ticket Code */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
                      {ticket.ticketCode}
                    </span>
                    {getStatusBadge(ticket.status)}
                  </div>

                  {/* Event Information */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2">
                      {event ? event.title : 'Event'}
                    </h3>

                    {event && (
                      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-blue-500 shrink-0" />
                          <span>{formatDate(event.eventStartDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-sky-500 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rejection notice if any */}
                  {ticket.status === RegistrationStatus.REJECTED && ticket.rejectionReason && (
                    <div className="p-3 rounded-2xl bg-red-50 border border-red-200/80 text-xs text-red-700 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>Alasan Penolakan:</strong> {ticket.rejectionReason}
                      </div>
                    </div>
                  )}

                  {/* Gate Check-in & Attendance status tags */}
                  {ticket.status === RegistrationStatus.CONFIRMED && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-100/60">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          isCheckedIn
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{isCheckedIn ? 'Checked-In Gate' : 'Belum Gate Check-In'}</span>
                      </span>

                      {event?.attendanceEnabled && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            isAttended
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>{isAttended ? 'Hadir Sesi' : 'Belum Hadir Sesi'}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="pt-4 border-t border-blue-100/60 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    Didaftarkan: {formatDate(ticket.createdAt)}
                  </div>

                  <Link to={`/ticket/${ticket.magicToken}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                      className="shadow-sm shadow-blue-500/20"
                    >
                      Buka E-Tiket
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;
