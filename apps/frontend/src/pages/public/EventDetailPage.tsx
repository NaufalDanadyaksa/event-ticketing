import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  CreditCard,
  Building2,
  Copy,
  Check,
  ArrowLeft,
  Ticket,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Share2,
} from 'lucide-react';
import { IEvent, IEventAvailability } from 'shared';
import { eventsApi, EventDetailResponse } from '@/services/api/events.api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<EventDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await eventsApi.getEventBySlug(slug);
        setData(response.data);
      } catch (err: any) {
        setErrorMessage(
          err.response?.data?.message || 'Event tidak ditemukan atau gagal dimuat'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  const handleCopyBankAccount = () => {
    if (data?.event.bankAccountNumber) {
      navigator.clipboard.writeText(data.event.bankAccountNumber);
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
  };

  const handleShareEvent = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatDateTime = (dateValue: Date | string) => {
    const d = new Date(dateValue);
    return d.toLocaleString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(num) || num === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" variant="primary" />
        <p className="text-xs text-slate-500 font-medium">Memuat detail event...</p>
      </div>
    );
  }

  if (errorMessage || !data) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white/70 backdrop-blur-md border border-red-200/80 rounded-3xl shadow-card">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Gagal Membuka Event</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {errorMessage || 'Data event tidak ditemukan.'}
        </p>
        <Link to="/" className="inline-block mt-4">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    );
  }

  const { event, availability, registeredCount } = data;
  const isPaid = event.isPaid;
  const priceDisplay = isPaid ? formatCurrency(event.price) : 'Gratis';

  const isDeadlinePassed = availability.deadlinePassed;
  const isQuotaFull = availability.quota > 0 && availability.remaining <= 0;
  const canRegister = availability.available;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Breadcrumb & Share */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Event</span>
        </Link>

        <button
          type="button"
          onClick={handleShareEvent}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 border border-blue-200/70 text-slate-700 hover:text-blue-600 shadow-sm transition-colors"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Tautan Disalin!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan</span>
            </>
          )}
        </button>
      </div>

      {/* Hero Banner Section */}
      <div className="relative w-full h-64 sm:h-96 rounded-3xl overflow-hidden shadow-xl border border-blue-200/60 mb-8 bg-gradient-to-br from-blue-600 via-sky-500 to-blue-700">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/90 gap-3">
            <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20">
              <Ticket className="w-16 h-16 text-white" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wider text-blue-100">
              Event Ticketing System
            </span>
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md ${
              isPaid ? 'bg-blue-600/90 text-white' : 'bg-emerald-600/90 text-white'
            }`}
          >
            {priceDisplay}
          </span>

          {event.attendanceEnabled && (
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-900/80 text-sky-100 border border-sky-400/30 backdrop-blur-md flex items-center gap-1 shadow-lg">
              <Zap className="w-3.5 h-3.5 text-sky-300" />
              <span>Absensi QR Dinamis</span>
            </span>
          )}
        </div>

        {/* Status indicator on banner */}
        <div className="absolute bottom-4 right-4">
          {isDeadlinePassed ? (
            <Badge variant="red" size="md">
              Pendaftaran Ditutup
            </Badge>
          ) : isQuotaFull ? (
            <Badge variant="red" size="md">
              Kuota Penuh
            </Badge>
          ) : (
            <Badge variant="green" size="md">
              Pendaftaran Dibuka
            </Badge>
          )}
        </div>
      </div>

      {/* Main Grid: Details & Registration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Event Information (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title & Category Header */}
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {event.title}
            </h1>
          </div>

          {/* Key Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white/70 backdrop-blur-md border border-blue-200/50 rounded-2xl flex items-start gap-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Waktu Pelaksanaan
                </p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  Mulai: {formatDateTime(event.eventStartDate)}
                </p>
                <p className="text-xs text-slate-600">
                  Selesai: {formatDateTime(event.eventEndDate)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-white/70 backdrop-blur-md border border-blue-200/50 rounded-2xl flex items-start gap-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Lokasi Venue
                </p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5 break-words">
                  {event.location}
                </p>
              </div>
            </div>

            <div className="p-4 bg-white/70 backdrop-blur-md border border-blue-200/50 rounded-2xl flex items-start gap-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Kapasitas & Kuota
                </p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  {availability.quota > 0 ? (
                    <>
                      Tersisa <strong className="text-blue-700">{availability.remaining}</strong>{' '}
                      kursi dari {availability.quota} total
                    </>
                  ) : (
                    'Kapasitas Tanpa Batas'
                  )}
                </p>
                <p className="text-[11px] text-slate-500">
                  {registeredCount} peserta terdaftar
                </p>
              </div>
            </div>

            <div className="p-4 bg-white/70 backdrop-blur-md border border-blue-200/50 rounded-2xl flex items-start gap-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Batas Akhir Pendaftaran
                </p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  {formatDateTime(event.registrationDeadline)}
                </p>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="p-6 bg-white/75 backdrop-blur-md border border-blue-200/60 rounded-3xl shadow-card space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-blue-100/60 pb-3">
              Deskripsi Event
            </h3>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {/* Bank Payment Information (if Paid) */}
          {isPaid && (
            <div className="p-6 bg-blue-50/70 backdrop-blur-md border border-blue-200 rounded-3xl shadow-card space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600 text-white">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Informasi Pembayaran Tiket
                  </h3>
                  <p className="text-xs text-slate-500">
                    Silakan transfer pembayaran ke rekening resmi berikut
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3 bg-white rounded-2xl border border-blue-200/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    Nama Bank
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {event.bankName || '-'}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-blue-200/60 sm:col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Nomor Rekening
                    </span>
                    <p className="text-base font-mono font-bold text-blue-700 mt-0.5">
                      {event.bankAccountNumber || '-'}
                    </p>
                    <p className="text-xs text-slate-600 font-medium">
                      a.n. {event.bankAccountHolder || '-'}
                    </p>
                  </div>

                  {event.bankAccountNumber && (
                    <button
                      type="button"
                      onClick={handleCopyBankAccount}
                      aria-label="Salin nomor rekening"
                      className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                    >
                      {copiedBank ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-white/70 rounded-xl text-xs text-slate-600 border border-blue-100">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Unggah bukti transfer Anda pada saat pendaftaran. Tiket Anda akan dikonfirmasi
                  setelah diverifikasi oleh Admin.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Action Card (1 col) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 bg-white/85 backdrop-blur-md border border-blue-200/70 rounded-3xl shadow-xl space-y-6">
            <div className="border-b border-blue-100/70 pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Biaya Pendaftaran
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {priceDisplay}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {isPaid ? 'Per peserta (transfer bank)' : 'Bebas biaya pendaftaran'}
              </span>
            </div>

            {/* Quota Progress */}
            {availability.quota > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Ketersediaan Kursi</span>
                  <span>{availability.remaining} Tersisa</span>
                </div>
                <div className="w-full h-2.5 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (registeredCount / availability.quota) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* CTA Button */}
            {canRegister ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(`/events/${event.slug}/register`)}
                className="w-full shadow-lg shadow-blue-500/20"
                rightIcon={<Ticket className="w-5 h-5" />}
              >
                Daftar Sekarang
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="dark"
                  size="lg"
                  disabled
                  className="w-full cursor-not-allowed opacity-60"
                >
                  {isDeadlinePassed ? 'Pendaftaran Ditutup' : 'Kuota Penuh'}
                </Button>
                <p className="text-[11px] text-center text-slate-500">
                  {isDeadlinePassed
                    ? 'Batas waktu pendaftaran telah berakhir.'
                    : 'Kapasitas maksimal peserta telah tercapai.'}
                </p>
              </div>
            )}

            <div className="border-t border-blue-100/70 pt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>E-Tiket resmi dengan QR Code unik</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-500 shrink-0" />
                <span>Akses mandiri ke riwayat tiket</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
