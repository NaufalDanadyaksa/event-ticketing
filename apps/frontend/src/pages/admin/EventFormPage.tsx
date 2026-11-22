import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  CalendarDays,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  MapPin,
  Clock,
  Users,
  Building,
  UserCheck,
  Check,
} from 'lucide-react';
import { adminApi, eventsApi } from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { getImageUrl } from '@/utils/imageUrl';

export const EventFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('0');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('0');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [attendanceEnabled, setAttendanceEnabled] = useState(true);
  const [isPublished, setIsPublished] = useState(false);

  // Banner file & preview
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Status states
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alertError, setAlertError] = useState<string | null>(null);

  // Helper to format ISO to datetime-local string (YYYY-MM-DDTHH:mm)
  const toDateTimeLocal = (dateVal: Date | string) => {
    try {
      const d = new Date(dateVal);
      const pad = (n: number) => (n < 10 ? `0${n}` : n);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (isEditMode && id) {
      const loadEvent = async () => {
        try {
          setPageLoading(true);
          const res = await eventsApi.getEventBySlug(id);
          if (res.success && res.data?.event) {
            const ev = res.data.event;
            setTitle(ev.title);
            setDescription(ev.description);
            setLocation(ev.location);
            setEventStartDate(toDateTimeLocal(ev.eventStartDate));
            setEventEndDate(toDateTimeLocal(ev.eventEndDate));
            setRegistrationDeadline(toDateTimeLocal(ev.registrationDeadline));
            setMaxParticipants(String(ev.maxParticipants || 0));
            setIsPaid(Boolean(ev.isPaid));
            setPrice(String(ev.price || 0));
            setBankName(ev.bankName || '');
            setBankAccountNumber(ev.bankAccountNumber || '');
            setBankAccountHolder(ev.bankAccountHolder || '');
            setAttendanceEnabled(Boolean(ev.attendanceEnabled));
            setIsPublished(Boolean(ev.isPublished));
            if (ev.bannerUrl) {
              setExistingBannerUrl(ev.bannerUrl);
              setBannerPreview(getImageUrl(ev.bannerUrl));
            }
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Gagal memuat data event';
          setAlertError(msg);
        } finally {
          setPageLoading(false);
        }
      };
      loadEvent();
    }
  }, [id, isEditMode]);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim() || title.length < 3) {
      newErrors.title = 'Judul minimal 3 karakter';
    }
    if (!description.trim() || description.length < 10) {
      newErrors.description = 'Deskripsi minimal 10 karakter';
    }
    if (!location.trim() || location.length < 3) {
      newErrors.location = 'Lokasi minimal 3 karakter';
    }
    if (!eventStartDate) {
      newErrors.eventStartDate = 'Waktu mulai event wajib diisi';
    }
    if (!eventEndDate) {
      newErrors.eventEndDate = 'Waktu selesai event wajib diisi';
    } else if (eventStartDate && new Date(eventEndDate) <= new Date(eventStartDate)) {
      newErrors.eventEndDate = 'Waktu selesai harus setelah waktu mulai';
    }
    if (!registrationDeadline) {
      newErrors.registrationDeadline = 'Batas pendaftaran wajib diisi';
    } else if (eventStartDate && new Date(registrationDeadline) > new Date(eventStartDate)) {
      newErrors.registrationDeadline = 'Batas pendaftaran tidak boleh melewati tanggal mulai';
    }

    if (isPaid) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        newErrors.price = 'Harga event berbayar harus lebih dari 0';
      }
      if (!bankName.trim()) {
        newErrors.bankName = 'Nama bank wajib diisi';
      }
      if (!bankAccountNumber.trim()) {
        newErrors.bankAccountNumber = 'Nomor rekening wajib diisi';
      }
      if (!bankAccountHolder.trim()) {
        newErrors.bankAccountHolder = 'Nama pemilik rekening wajib diisi';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertError(null);

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('location', location.trim());
      formData.append('eventStartDate', new Date(eventStartDate).toISOString());
      formData.append('eventEndDate', new Date(eventEndDate).toISOString());
      formData.append('registrationDeadline', new Date(registrationDeadline).toISOString());
      formData.append('maxParticipants', String(parseInt(maxParticipants, 10) || 0));
      formData.append('isPaid', String(isPaid));
      formData.append('price', String(isPaid ? Number(price) : 0));
      formData.append('attendanceEnabled', String(attendanceEnabled));
      formData.append('isPublished', String(isPublished));

      if (isPaid) {
        formData.append('bankName', bankName.trim());
        formData.append('bankAccountNumber', bankAccountNumber.trim());
        formData.append('bankAccountHolder', bankAccountHolder.trim());
      }

      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      if (isEditMode && id) {
        const res = await adminApi.updateEvent(id, formData);
        if (res.success) {
          navigate('/admin/events');
        }
      } else {
        const res = await adminApi.createEvent(formData);
        if (res.success) {
          navigate('/admin/events');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan data event';
      setAlertError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Spinner size="lg" variant="primary" />
        <p className="text-sm font-semibold">Memuat formulir event...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button and page header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Event</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <CalendarDays className="w-7 h-7 text-blue-600" />
          <span>{isEditMode ? 'Edit Informasi Event' : 'Buat Event Baru'}</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Lengkapi detail event, informasi rekening pembayaran, dan konfigurasi absensi dinamis.
        </p>
      </div>

      {alertError && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-3 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{alertError}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
            <CardDescription>Judul, deskripsi lengkap, dan lokasi penyelenggaraan event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Judul Event"
              placeholder="Contoh: Tech Conference 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              required
            />

            <div className="w-full flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Deskripsi Event
              </label>
              <textarea
                rows={4}
                placeholder="Tuliskan gambaran umum, agenda, dan informasi penting bagi peserta..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-3.5 border rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-all duration-150 ${
                  errors.description
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {errors.description && (
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.description}</span>
                </p>
              )}
            </div>

            <Input
              label="Lokasi / Venue"
              placeholder="Contoh: Grand Ballroom Hotel Indonesia, Jakarta"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              error={errors.location}
              leftIcon={<MapPin className="w-4 h-4" />}
              required
            />
          </CardContent>
        </Card>

        {/* Banner Upload Card */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Banner Event</CardTitle>
            <CardDescription>Unggah gambar banner promosi event (rekomendasi rasio 16:9)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full sm:w-64 h-36 rounded-2xl bg-blue-100/60 border-2 border-dashed border-blue-300 flex items-center justify-center overflow-hidden shrink-0">
                {bannerPreview || (isEditMode && existingBannerUrl) ? (
                  <img
                    src={bannerFile && bannerPreview ? bannerPreview : getImageUrl(existingBannerUrl) || bannerPreview || ''}
                    alt="Pratinjau Banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-blue-500">
                    <ImageIcon className="w-8 h-8 opacity-60" />
                    <span className="text-xs font-semibold text-slate-500">Belum ada banner</span>
                  </div>
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 shadow-sm transition-all">
                  <Upload className="w-4 h-4" />
                  <span>{bannerPreview ? 'Ganti Banner' : 'Pilih Gambar Banner'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-slate-400">
                  Format didukung: JPG, PNG, WEBP. Maksimal ukuran file 5MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Capacity Card */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Waktu & Kuota Peserta</CardTitle>
            <CardDescription>Pengaturan jadwal pelaksanaan dan batas kuota peserta</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="datetime-local"
              label="Waktu Mulai Event"
              value={eventStartDate}
              onChange={(e) => setEventStartDate(e.target.value)}
              error={errors.eventStartDate}
              required
            />

            <Input
              type="datetime-local"
              label="Waktu Selesai Event"
              value={eventEndDate}
              onChange={(e) => setEventEndDate(e.target.value)}
              error={errors.eventEndDate}
              required
            />

            <Input
              type="datetime-local"
              label="Batas Akhir Pendaftaran"
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
              error={errors.registrationDeadline}
              required
            />

            <Input
              type="number"
              min={0}
              label="Kapasitas Maksimal Peserta"
              helperText="Isi 0 untuk kuota tidak terbatas (unlimited)"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              error={errors.maxParticipants}
              leftIcon={<Users className="w-4 h-4" />}
            />
          </CardContent>
        </Card>

        {/* Payment Configuration Card */}
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Biaya & Rekening Pembayaran</CardTitle>
                <CardDescription>Pilih tipe event gratis atau berbayar dengan transfer bank</CardDescription>
              </div>

              {/* Is Paid Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs font-semibold text-slate-700">Event Berbayar</span>
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </CardHeader>

          {isPaid && (
            <CardContent className="space-y-4 border-t border-blue-100/60 pt-4">
              <Input
                type="number"
                min={1000}
                label="Harga Tiket (Rp)"
                placeholder="Contoh: 150000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                error={errors.price}
                leftIcon={<CreditCard className="w-4 h-4" />}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Nama Bank"
                  placeholder="Contoh: BCA, Mandiri, BNI"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  error={errors.bankName}
                  leftIcon={<Building className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Nomor Rekening"
                  placeholder="Contoh: 1234567890"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  error={errors.bankAccountNumber}
                  required
                />

                <Input
                  label="Atas Nama (Pemilik)"
                  placeholder="Contoh: Panitia Event"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  error={errors.bankAccountHolder}
                  leftIcon={<UserCheck className="w-4 h-4" />}
                  required
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Feature Switches Card */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Fitur & Publikasi</CardTitle>
            <CardDescription>Pengaturan dynamic QR check-in dan visibilitas di beranda publik</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/70 rounded-2xl border border-blue-200/60">
              <div>
                <p className="text-sm font-bold text-slate-800">Sistem Absensi Dinamis (TOTP / QR 10 Detik)</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aktifkan layar proyektor kode QR berputar untuk verifikasi kehadiran peserta.
                </p>
              </div>
              <label className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={attendanceEnabled}
                  onChange={(e) => setAttendanceEnabled(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/70 rounded-2xl border border-blue-200/60">
              <div>
                <p className="text-sm font-bold text-slate-800">Publikasikan Event Sekarang</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jika tidak dicentang, event akan berstatus Draft dan belum terlihat oleh umum.
                </p>
              </div>
              <label className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/events')}
            disabled={submitting}
          >
            Batal
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            leftIcon={<Check className="w-4 h-4" />}
            className="shadow-blue-500/25"
          >
            {isEditMode ? 'Simpan Perubahan' : 'Buat Event'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EventFormPage;
