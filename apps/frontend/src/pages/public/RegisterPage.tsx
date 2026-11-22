import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Ticket,
  User,
  Mail,
  Phone,
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  X,
  CreditCard,
  Building2,
  Copy,
  Check,
  ShieldCheck,
  LogIn,
  Clock,
} from 'lucide-react';
import { IEvent, IRegistration } from 'shared';
import { eventsApi } from '@/services/api/events.api';
import { registrationsApi } from '@/services/api/registrations.api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

export const RegisterPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [event, setEvent] = useState<IEvent | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // Validation & Submission states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registeredTicket, setRegisteredTicket] = useState<IRegistration | null>(null);

  const [copiedBank, setCopiedBank] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Event
  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) return;
      setIsLoadingEvent(true);
      setLoadError(null);
      try {
        const response = await eventsApi.getEventBySlug(slug);
        setEvent(response.data.event);
      } catch (err: any) {
        setLoadError(
          err.response?.data?.message || 'Gagal memuat event untuk pendaftaran.'
        );
      } finally {
        setIsLoadingEvent(false);
      }
    };

    fetchEvent();
  }, [slug]);

  // Autofill user info if logged in
  useEffect(() => {
    if (user) {
      if (!name) setName(user.name || '');
      if (!email) setEmail(user.email || '');
      if (!phone) setPhone(user.phone || '');
    }
  }, [user]);

  // Handle receipt selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, receipt: 'Ukuran file maksimal 5MB' }));
      return;
    }

    setReceiptFile(file);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.receipt;
      return copy;
    });

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyBankAccount = () => {
    if (event?.bankAccountNumber) {
      navigator.clipboard.writeText(event.bankAccountNumber);
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Nama lengkap minimal 2 karakter';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!phone.trim() || phone.trim().length < 8) {
      newErrors.phone = 'Nomor telepon/WhatsApp minimal 8 digit';
    }

    if (event?.isPaid && !receiptFile) {
      newErrors.receipt = 'Wajib mengunggah bukti transfer pembayaran untuk event berbayar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('eventId', event.id);
      formData.append('name', name.trim());
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());

      if (receiptFile) {
        formData.append('paymentProof', receiptFile);
      }

      const response = await registrationsApi.registerForEvent(event.id, formData);
      setRegisteredTicket(response.data);
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message || 'Pendaftaran gagal dilakukan. Silakan periksa kembali data Anda.'
      );
    } finally {
      setIsSubmitting(false);
    }
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

  if (isLoadingEvent) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" variant="primary" />
        <p className="text-xs text-slate-500 font-medium">Memuat form pendaftaran...</p>
      </div>
    );
  }

  if (loadError || !event) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white/70 backdrop-blur-md border border-red-200/80 rounded-3xl shadow-card">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Event Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1">{loadError}</p>
        <Link to="/" className="inline-block mt-4">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    );
  }

  // Success view once registered
  if (registeredTicket) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white/85 backdrop-blur-md border border-blue-200/70 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md">
            <CheckCircle className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Pendaftaran Berhasil!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              Selamat, data Anda telah berhasil terdaftar untuk event{' '}
              <strong className="text-blue-700">{event.title}</strong>.
            </p>
          </div>

          <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/60 text-left space-y-3">
            {registeredTicket.status === 'CONFIRMED' && registeredTicket.ticketCode ? (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold uppercase tracking-wider">
                  Kode Tiket
                </span>
                <span className="font-mono font-bold text-sm text-blue-700 bg-white px-3 py-1 rounded-lg border border-blue-200">
                  {registeredTicket.ticketCode}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold uppercase tracking-wider">
                  Status
                </span>
                <span className="font-semibold text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                  {registeredTicket.status === 'PAYMENT_SUBMITTED'
                    ? 'Menunggu Review Pembayaran Admin'
                    : 'Menunggu Pembayaran'}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold uppercase tracking-wider">
                Status Pendaftaran
              </span>
              <span className="font-bold text-slate-800">
                {registeredTicket.status === 'CONFIRMED'
                  ? 'Terkonfirmasi (CONFIRMED)'
                  : registeredTicket.status === 'PAYMENT_SUBMITTED'
                  ? 'Menunggu Review Pembayaran'
                  : 'Menunggu Pembayaran'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold uppercase tracking-wider">
                Peserta
              </span>
              <span className="font-semibold text-slate-800">
                {registeredTicket.name} ({registeredTicket.email})
              </span>
            </div>
          </div>

          {registeredTicket.status === 'CONFIRMED' && registeredTicket.ticketCode ? (
            <p className="text-xs text-slate-500 leading-relaxed">
              Link akses e-tiket juga telah dikirimkan ke email <strong>{email}</strong>. Anda dapat
              langsung membuka e-tiket sekarang.
            </p>
          ) : (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 text-left space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Tiket Resmi Akan Diterbitkan Setelah Pembayaran Dikonfirmasi</span>
              </p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Bukti transfer Anda sedang dalam antrean review oleh Admin. Setelah disetujui, kode tiket resmi dan QR check-in akan diterbitkan otomatis serta dikirimkan ke email <strong>{email}</strong>.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/tickets/${registeredTicket.magicToken}`)}
              className="w-full sm:w-auto px-6 shadow-md shadow-blue-500/20"
              leftIcon={<Ticket className="w-4 h-4" />}
            >
              Lihat E-Tiket Digital
            </Button>

            {isAuthenticated && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/my-tickets')}
                className="w-full sm:w-auto px-6"
              >
                Tiket Saya
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top back link */}
      <div className="mb-6">
        <Link
          to={`/events/${event.slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Detail Event</span>
        </Link>
      </div>

      {/* Main Registration Card */}
      <div className="bg-white/85 backdrop-blur-md border border-blue-200/70 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        {/* Card Header */}
        <div className="border-b border-blue-100/70 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Formulir Pendaftaran
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {event.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Biaya:{' '}
              <strong className="text-slate-800">
                {event.isPaid ? formatCurrency(event.price) : 'Gratis'}
              </strong>
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
            {event.isPaid ? 'Event Berbayar' : 'Event Gratis'}
          </div>
        </div>

        {/* Notice for Guest Users */}
        {!isAuthenticated && (
          <div className="p-4 bg-sky-50/70 border border-sky-200/60 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-700 shrink-0">
                <LogIn className="w-4 h-4" />
              </div>
              <p className="text-xs text-sky-900 leading-relaxed">
                Sudah punya akun? Masuk untuk menyimpan tiket langsung ke akun Anda.
              </p>
            </div>
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-sky-700 bg-white border border-sky-300 hover:bg-sky-50 shrink-0 transition-colors"
            >
              Masuk
            </Link>
          </div>
        )}

        {/* Submission Error Banner */}
        {submitError && (
          <div className="p-4 bg-red-50/90 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-red-700 leading-relaxed">{submitError}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Attendee Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
              Data Diri Peserta
            </h3>

            <Input
              label="Nama Lengkap"
              placeholder="Contoh: Budi Santoso"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              error={errors.name}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Alamat Email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                error={errors.email}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Nomor Telepon / WhatsApp"
                type="tel"
                placeholder="081234567890"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                error={errors.phone}
                leftIcon={<Phone className="w-4 h-4" />}
                required
              />
            </div>
          </div>

          {/* Payment Section (if Paid) */}
          {event.isPaid && (
            <div className="space-y-4 pt-4 border-t border-blue-100/70">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
                Informasi & Bukti Pembayaran
              </h3>

              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Total Tagihan:</span>
                  <span className="text-base font-black text-blue-700">
                    {formatCurrency(event.price)}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-blue-200/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {event.bankName || 'Bank Transfer'}
                    </span>
                    <p className="text-sm font-mono font-bold text-slate-900">
                      {event.bankAccountNumber || '-'}
                    </p>
                    <p className="text-[11px] text-slate-500">
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

              {/* Receipt File Upload */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Upload Bukti Transfer</span>
                  <span className="text-red-500">*Wajib</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!receiptFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-blue-50/60 ${
                      errors.receipt
                        ? 'border-red-400 bg-red-50/20'
                        : 'border-blue-300 bg-blue-50/30'
                    }`}
                  >
                    <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      Klik untuk memilih file bukti transfer
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Format JPG, PNG, atau PDF (Maks. 5MB)
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-2xl border border-blue-200/80 flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      {receiptPreview ? (
                        <img
                          src={receiptPreview}
                          alt="Bukti Transfer Preview"
                          className="w-12 h-12 rounded-xl object-cover border border-blue-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {receiptFile.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {(receiptFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveReceipt}
                      aria-label="Hapus file bukti"
                      className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {errors.receipt && (
                  <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.receipt}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4 border-t border-blue-100/70">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full shadow-lg shadow-blue-500/20"
              leftIcon={<CheckCircle className="w-5 h-5" />}
            >
              Konfirmasi Pendaftaran
            </Button>
            <p className="text-[11px] text-slate-500 text-center mt-3 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Dengan mendaftar, Anda menyetujui ketentuan dan kebijakan event.</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
