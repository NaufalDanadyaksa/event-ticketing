import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Ticket,
  QrCode,
  CheckCircle,
  AlertTriangle,
  Clock,
  Camera,
  ArrowLeft,
  Printer,
  ShieldCheck,
  RefreshCw,
  XCircle,
  ScanLine,
} from 'lucide-react';
import {
  RegistrationStatus,
  CheckInStatus,
  AttendanceStatus,
  IRegistration,
  IEvent,
} from 'shared';
import { registrationsApi, TicketViewResponse } from '@/services/api/registrations.api';
import { attendanceApi } from '@/services/api/attendance.api';
import { TicketCard } from '@/components/TicketCard';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { QRScanner } from '@/components/QRScanner';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';

export const DigitalTicketPage: React.FC = () => {
  const { magicToken } = useParams<{ magicToken: string }>();

  const [data, setData] = useState<TicketViewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const fetchTicket = async () => {
    if (!magicToken) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await registrationsApi.getTicketByMagicToken(magicToken);
      setData(response.data);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'E-Tiket tidak ditemukan atau tautan tidak valid.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [magicToken]);

  const handleOpenScanner = () => {
    setScanResult(null);
    setIsScannerOpen(true);
  };

  const handleCloseScanner = () => {
    setIsScannerOpen(false);
    setScanResult(null);
  };

  const handleScanAttendance = async (decodedText: string) => {
    if (isVerifying || !magicToken) return;

    setIsVerifying(true);
    setScanResult(null);

    try {
      const response = await attendanceApi.verifyAttendance({
        qrPayload: decodedText,
        magicToken,
      });

      setScanResult({
        success: true,
        message: response.data.message || 'Kehadiran Anda berhasil diverifikasi!',
      });

      // Update local registration state
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          registration: {
            ...prev.registration,
            attendanceStatus: AttendanceStatus.ATTENDED,
            attendedAt: response.data.attendedAt || new Date(),
          },
        };
      });
    } catch (err: any) {
      setScanResult({
        success: false,
        message:
          err.response?.data?.message ||
          'QR absensi tidak valid atau telah kadaluarsa. Pastikan Anda mengarahkan kamera ke layar proyektor.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" variant="primary" />
        <p className="text-xs text-slate-500 font-medium">Memuat e-tiket digital...</p>
      </div>
    );
  }

  if (errorMessage || !data) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white/70 backdrop-blur-md border border-red-200 rounded-3xl shadow-card space-y-4">
        <div className="w-14 h-14 mx-auto rounded-3xl bg-red-100 text-red-600 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">E-Tiket Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {errorMessage || 'Tautan tiket digital Anda tidak valid.'}
        </p>
        <Link to="/" className="inline-block pt-2">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    );
  }

  const { registration, event } = data;
  const isConfirmed = registration.status === RegistrationStatus.CONFIRMED;
  const isCheckedIn = registration.checkInStatus === CheckInStatus.CHECKED_IN;
  const isAttended = registration.attendanceStatus === AttendanceStatus.ATTENDED;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Nav & Print Actions (Hidden on Print) */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchTicket}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Segarkan
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Cetak Tiket
          </Button>
        </div>
      </div>

      {/* Main Ticket Presentation Card */}
      <TicketCard
        ticketCode={registration.ticketCode}
        eventTitle={event.title}
        eventStartDate={event.eventStartDate}
        eventEndDate={event.eventEndDate}
        eventLocation={event.location}
        attendeeName={registration.name}
        attendeeEmail={registration.email}
        attendeePhone={registration.phone}
        status={registration.status}
        checkInStatus={registration.checkInStatus}
        checkedInAt={registration.checkedInAt}
        attendanceStatus={registration.attendanceStatus}
        attendedAt={registration.attendedAt}
        attendanceEnabled={event.attendanceEnabled}
        onScanAttendance={handleOpenScanner}
      />

      {/* Action Sections Grid (Hidden on Print) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        {/* Gate Check-in Section */}
        <div className="bg-white/80 backdrop-blur-md border border-blue-200/60 rounded-3xl p-6 shadow-card flex flex-col items-center justify-between text-center gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Pintu Masuk Venue
            </span>
            <h3 className="text-base font-bold text-slate-900">QR Check-in Gerbang</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Perlihatkan QR code berikut kepada staf pintu masuk saat tiba di lokasi acara.
            </p>
          </div>

          <div className="p-2">
            <QRCodeDisplay
              value={registration.ticketCode}
              size={180}
              subLabel={`Kode Tiket: ${registration.ticketCode}`}
            />
          </div>

          <div className="w-full pt-4 border-t border-blue-100/60 flex items-center justify-center gap-2">
            {isCheckedIn ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-4 h-4" />
                <span>Sudah Check-In di Gerbang</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Clock className="w-4 h-4" />
                <span>Menunggu Check-In Gerbang</span>
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Attendance Verification Section */}
        <div className="bg-white/80 backdrop-blur-md border border-blue-200/60 rounded-3xl p-6 shadow-card flex flex-col justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
                <ScanLine className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
                  Sesi Acara
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Presensi Kehadiran Dinamis
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-2">
              Verifikasi kehadiran sesi dilakukan secara mandiri dengan memindai QR Code
              berotasi 10 detik yang tampil di layar proyektor venue acara.
            </p>
          </div>

          {/* Conditional Attendance Status */}
          <div className="space-y-4">
            {!event.attendanceEnabled ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                Fitur absensi sesi tidak diaktifkan pada event ini.
              </div>
            ) : !isConfirmed ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Tiket Anda belum terkonfirmasi. Selesaikan pembayaran untuk dapat mencatat
                  kehadiran.
                </span>
              </div>
            ) : isAttended ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-1 text-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <p className="font-bold text-sm">Kehadiran Berhasil Tercatat!</p>
                <p className="text-[11px] text-emerald-600">
                  Terima kasih atas partisipasi aktif Anda dalam sesi event ini.
                </p>
              </div>
            ) : !isCheckedIn ? (
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-sky-600" />
                <span>
                  <strong>Perhatian:</strong> Anda harus melakukan check-in di gerbang masuk
                  venue terlebih dahulu sebelum dapat memindai QR absensi sesi.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Gate check-in telah terverifikasi. Anda siap memindai QR absensi.</span>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleOpenScanner}
                  className="w-full shadow-md shadow-blue-500/20"
                  leftIcon={<Camera className="w-4 h-4" />}
                >
                  Pindai QR Absensi Layar
                </Button>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-blue-100/60 text-[11px] text-slate-400 text-center">
            Sistem QR Code Dinamis berbasis TOTP/HMAC toleransi 10 detik
          </div>
        </div>
      </div>

      {/* Interactive Modal: Camera QR Scanner for Attendance */}
      <Modal
        isOpen={isScannerOpen}
        onClose={handleCloseScanner}
        title="Pindai QR Absensi Proyektor"
        description="Arahkan kamera HP ke QR Code yang berputar setiap 10 detik di layar presenter venue."
        maxWidth="lg"
      >
        <div className="space-y-4">
          {/* Active Scanner Viewport */}
          {!scanResult?.success && (
            <div className="py-2">
              <QRScanner onScan={handleScanAttendance} />
            </div>
          )}

          {/* Verifying Spinner Indicator */}
          {isVerifying && (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-center gap-3">
              <Spinner size="sm" variant="primary" />
              <span className="text-xs font-semibold text-blue-700">
                Memverifikasi keabsahan token QR...
              </span>
            </div>
          )}

          {/* Scan Result Feedback Banner */}
          {scanResult && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-fade-in ${
                scanResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {scanResult.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">
                  {scanResult.success ? 'Absensi Terverifikasi!' : 'Verifikasi Gagal'}
                </p>
                <p className="leading-relaxed">{scanResult.message}</p>
              </div>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-blue-100">
            {scanResult?.success ? (
              <Button variant="primary" size="sm" onClick={handleCloseScanner}>
                Selesai
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={handleCloseScanner}>
                Tutup Kamera
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DigitalTicketPage;
