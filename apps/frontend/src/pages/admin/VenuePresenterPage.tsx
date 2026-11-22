import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Monitor,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Users,
  CheckCircle2,
  Calendar,
  MapPin,
  RefreshCw,
  AlertCircle,
  Scan,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { adminApi, eventsApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { AttendanceTimer } from '@/components/AttendanceTimer';
import { AttendanceStatus, RegistrationStatus, type IEvent, type IRegistrationListItem } from 'shared';

export const VenuePresenterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<IEvent | null>(null);
  const [qrPayload, setQrPayload] = useState<string>('');
  const [timeStep, setTimeStep] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live stats
  const [totalConfirmed, setTotalConfirmed] = useState<number>(0);
  const [totalAttended, setTotalAttended] = useState<number>(0);
  const [recentAttendees, setRecentAttendees] = useState<IRegistrationListItem[]>([]);

  // Polling ref
  const isPollingRef = useRef(false);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Fetch event details
  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      try {
        const res = await eventsApi.getEventBySlug(id);
        if (res.success && res.data?.event) {
          setEvent(res.data.event);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal memuat informasi event';
        setError(msg);
      }
    };
    fetchEvent();
  }, [id]);

  // Polling token & attendee stats every 5 seconds
  const fetchLiveTokenAndStats = async () => {
    if (!id || isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      const [tokenRes, regRes] = await Promise.all([
        adminApi.getLiveAttendanceToken(id),
        adminApi.listRegistrations({ eventId: id }),
      ]);

      if (tokenRes.success && tokenRes.data) {
        setQrPayload(tokenRes.data.qrPayload);
        setTimeStep(tokenRes.data.timeStep);
        setError(null);
      }

      if (regRes.success && regRes.data) {
        const list = regRes.data;
        const confirmed = list.filter((r) => r.status === RegistrationStatus.CONFIRMED);
        const attended = confirmed.filter(
          (r) => r.attendanceStatus === AttendanceStatus.ATTENDED
        );
        setTotalConfirmed(confirmed.length);
        setTotalAttended(attended.length);

        // Sort by attendedAt desc
        const sortedAttended = [...attended].sort((a, b) => {
          const dateA = a.attendedAt ? new Date(a.attendedAt).getTime() : 0;
          const dateB = b.attendedAt ? new Date(b.attendedAt).getTime() : 0;
          return dateB - dateA;
        });
        setRecentAttendees(sortedAttended.slice(0, 5));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui token absensi dinamis';
      setError(msg);
    } finally {
      setLoading(false);
      isPollingRef.current = false;
    }
  };

  useEffect(() => {
    fetchLiveTokenAndStats();
    const interval = setInterval(fetchLiveTokenAndStats, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const attendancePercentage =
    totalConfirmed > 0 ? Math.round((totalAttended / totalConfirmed) * 100) : 0;

  const formatDate = (dateVal?: Date | string | null) => {
    if (!dateVal) return '-';
    try {
      return new Date(dateVal).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return String(dateVal);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex flex-col p-4 sm:p-6 md:p-8">
      {/* Top Bar Navigation */}
      <header className="flex items-center justify-between pb-6 border-b border-blue-900/50">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/events"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Kembali ke Panel Admin"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Layar Presenter Absensi</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live TOTP
                </span>
              </h1>
              <p className="text-xs text-sky-300">
                {event ? event.title : 'Memuat data event...'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            leftIcon={
              isFullscreen ? <Minimize2 className="w-4 h-4 text-sky-400" /> : <Maximize2 className="w-4 h-4 text-sky-400" />
            }
            className="text-white border-blue-800/80 hover:bg-blue-900/40"
          >
            {isFullscreen ? 'Keluar Fullscreen' : 'Mode Layar Penuh'}
          </Button>
        </div>
      </header>

      {/* Error alert */}
      {error && (
        <div className="my-4 p-4 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Presenter Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
        {/* Left Col: Event Details & Real-Time Stats (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-blue-900/60 shadow-xl space-y-4">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                Konferensi & Seminar
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 leading-tight">
                {event?.title || 'Memuat...'}
              </h2>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{formatDate(event?.eventStartDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="truncate">{event?.location || '-'}</span>
              </div>
            </div>
          </div>

          {/* Real-Time Live Attendees Counter */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-blue-900/40 backdrop-blur-md border border-blue-700/40 shadow-lg">
              <div className="flex items-center justify-between text-sky-300 text-xs font-semibold">
                <span>Total Hadir</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white mt-2 font-mono">
                {totalAttended}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Dari {totalConfirmed} tiket terkonfirmasi
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-sky-900/30 backdrop-blur-md border border-sky-700/40 shadow-lg">
              <div className="flex items-center justify-between text-sky-300 text-xs font-semibold">
                <span>Persentase</span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-sky-300 mt-2 font-mono">
                {attendancePercentage}%
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Tingkat kehadiran peserta
              </p>
            </div>
          </div>

          {/* Recent Attendees Feed */}
          {recentAttendees.length > 0 && (
            <div className="p-5 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800">
              <p className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Kehadiran Terkini</span>
              </p>
              <div className="space-y-2">
                {recentAttendees.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-semibold text-white">{att.name}</span>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {att.ticketCode}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Rotating QR Code Display & 10s Timer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-6">
          <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white/95 backdrop-blur-xl border-4 border-blue-400/50 shadow-2xl text-slate-900 flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 mb-6">
              <Scan className="w-3.5 h-3.5" />
              Scan QR Kehadiran
            </span>

            {/* QR Code Canvas */}
            {loading && !qrPayload ? (
              <div className="w-64 h-64 flex flex-col items-center justify-center gap-3">
                <Spinner size="xl" variant="primary" />
                <p className="text-xs text-slate-500 font-semibold">
                  Membuat token absensi dinamis...
                </p>
              </div>
            ) : qrPayload ? (
              <QRCodeDisplay
                value={qrPayload}
                size={260}
                level="M"
                includeMargin={false}
              />
            ) : (
              <div className="w-64 h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
                <AlertCircle className="w-8 h-8 text-rose-500" />
                <p className="text-xs font-semibold">Gagal memuat token QR</p>
              </div>
            )}

            {/* 10-Second Rotating Timer Countdown */}
            <div className="w-full mt-6">
              <AttendanceTimer
                durationSeconds={10}
                resetKey={timeStep}
                showTimeText={true}
              />
            </div>
          </div>

          {/* Attendee Instructions Banner */}
          <div className="w-full max-w-md p-4 rounded-2xl bg-blue-900/40 border border-blue-700/50 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-sky-300">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Petunjuk Peserta</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Buka tiket digital di HP Anda, tekan tombol <strong className="text-white font-semibold">"Scan Kehadiran"</strong>, lalu arahkan kamera ke kode QR di layar ini.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenuePresenterPage;
