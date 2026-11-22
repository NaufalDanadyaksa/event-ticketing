import React, { useEffect, useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Check,
  X,
  Eye,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  Ticket,
} from 'lucide-react';
import { adminApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { RegistrationStatus, type IRegistrationListItem } from 'shared';

export const PaymentReviewPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<IRegistrationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<string>('PAYMENT_SUBMITTED');

  // Preview Modal state
  const [previewItem, setPreviewItem] = useState<IRegistrationListItem | null>(null);

  // Reject Modal state
  const [rejectingItem, setRejectingItem] = useState<IRegistrationListItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Action status
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await adminApi.listRegistrations();
      if (res.success && res.data) {
        setRegistrations(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat data pendaftaran';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleApprove = async (reg: IRegistrationListItem) => {
    try {
      setSubmittingId(reg.id);
      const res = await adminApi.reviewPayment(reg.id, { action: 'APPROVE' });
      if (res.success) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === reg.id ? { ...r, status: RegistrationStatus.CONFIRMED } : r
          )
        );
        setFeedback({
          type: 'success',
          message: `Pembayaran tiket ${reg.ticketCode} atas nama ${reg.name} berhasil disetujui!`,
        });
        if (previewItem?.id === reg.id) {
          setPreviewItem(null);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyetujui pembayaran';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;

    if (!rejectionReason.trim() || rejectionReason.trim().length < 10) {
      setRejectError('Alasan penolakan wajib diisi minimal 10 karakter');
      return;
    }

    try {
      setSubmittingId(rejectingItem.id);
      const res = await adminApi.reviewPayment(rejectingItem.id, {
        action: 'REJECT',
        rejectionReason: rejectionReason.trim(),
      });
      if (res.success) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === rejectingItem.id
              ? {
                  ...r,
                  status: RegistrationStatus.REJECTED,
                  rejectionReason: rejectionReason.trim(),
                }
              : r
          )
        );
        setFeedback({
          type: 'success',
          message: `Pembayaran tiket ${rejectingItem.ticketCode} telah ditolak.`,
        });
        setRejectingItem(null);
        setRejectionReason('');
        setRejectError(null);
        if (previewItem?.id === rejectingItem.id) {
          setPreviewItem(null);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menolak pembayaran';
      setRejectError(msg);
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const matchesSearch =
        reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (reg.eventTitle && reg.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (statusTab === 'ALL') return true;
      return reg.status === statusTab;
    });
  }, [registrations, searchQuery, statusTab]);

  const countByStatus = (status: string) => {
    if (status === 'ALL') return registrations.length;
    return registrations.filter((r) => r.status === status).length;
  };

  const getFullImageUrl = (path?: string | null) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:3000';
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <CreditCard className="w-7 h-7 text-blue-600" />
          <span>Verifikasi Pembayaran Tiket</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tinjau bukti transfer pendaftar, setujui tiket, atau tolak dengan alasan yang jelas.
        </p>
      </div>

      {/* Alert Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-semibold transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs uppercase font-bold tracking-wider hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Search and Filter Tabs */}
      <Card variant="glass" className="p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          {/* Search Box */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama peserta, kode tiket, email, atau judul event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-blue-200 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { key: 'PAYMENT_SUBMITTED', label: 'Menunggu Verifikasi' },
              { key: 'CONFIRMED', label: 'Terkonfirmasi' },
              { key: 'REJECTED', label: 'Ditolak' },
              { key: 'WAITING_PAYMENT', label: 'Menunggu Pembayaran' },
              { key: 'ALL', label: 'Semua Status' },
            ].map((tab) => {
              const count = countByStatus(tab.key);
              const isActive = statusTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusTab(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white/80 text-slate-600 hover:bg-blue-50 border border-blue-200/50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Table Data */}
      <Card variant="glass" className="overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Spinner size="lg" variant="primary" />
            <p className="text-sm font-semibold">Memuat data pendaftaran...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 rounded-3xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
              <Receipt className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Tidak ada data ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Tidak ada data pendaftaran yang sesuai dengan filter atau kata kunci pencarian saat ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-blue-100 bg-blue-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Peserta & Tiket</th>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Bukti Bayar</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50 text-sm">
                {filteredRegistrations.map((reg) => {
                  const isActionLoading = submittingId === reg.id;
                  const isSubmitted = reg.status === RegistrationStatus.PAYMENT_SUBMITTED;

                  return (
                    <tr
                      key={reg.id}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      {/* Peserta & Tiket */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                              {reg.ticketCode}
                            </span>
                            <span className="font-bold text-slate-900">{reg.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {reg.email}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {reg.phone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Event Title */}
                      <td className="py-4 px-4 text-xs font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate max-w-[200px]">{reg.eventTitle}</span>
                        </div>
                      </td>

                      {/* Payment Proof Thumbnail */}
                      <td className="py-4 px-4">
                        {reg.paymentProofUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewItem(reg)}
                            className="group flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white border border-blue-200/70 hover:border-blue-400 transition-all text-xs font-semibold text-blue-700"
                          >
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                              <img
                                src={getFullImageUrl(reg.paymentProofUrl)}
                                alt="Bukti Transfer"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                            </div>
                            <span className="inline-flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-blue-500" />
                              <span>Lihat Bukti</span>
                            </span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum diunggah</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        <Badge status={reg.status} />
                        {reg.rejectionReason && (
                          <p className="text-[11px] text-rose-600 mt-1 max-w-[180px] truncate" title={reg.rejectionReason}>
                            Alasan: {reg.rejectionReason}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        {isSubmitted ? (
                          <div className="inline-flex items-center gap-2 justify-end">
                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                              onClick={() => handleApprove(reg)}
                              isLoading={isActionLoading}
                              className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                            >
                              Setujui
                            </Button>

                            <Button
                              variant="danger"
                              size="sm"
                              leftIcon={<X className="w-3.5 h-3.5" />}
                              onClick={() => {
                                setRejectingItem(reg);
                                setRejectionReason('');
                                setRejectError(null);
                              }}
                              disabled={isActionLoading}
                            >
                              Tolak
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Selesai diproses</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Receipt Image Preview Modal */}
      {previewItem && (
        <Modal
          isOpen={Boolean(previewItem)}
          onClose={() => setPreviewItem(null)}
          title={`Bukti Pembayaran: ${previewItem.ticketCode}`}
          description={`Atas nama ${previewItem.name} untuk event ${previewItem.eventTitle}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="w-full max-h-[500px] rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center p-2">
              <img
                src={getFullImageUrl(previewItem.paymentProofUrl)}
                alt="Bukti Transfer Penuh"
                className="max-h-[480px] w-auto object-contain rounded-xl"
              />
            </div>

            {previewItem.status === RegistrationStatus.PAYMENT_SUBMITTED && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="danger"
                  leftIcon={<X className="w-4 h-4" />}
                  onClick={() => {
                    setRejectingItem(previewItem);
                    setRejectionReason('');
                    setRejectError(null);
                  }}
                >
                  Tolak Pembayaran
                </Button>

                <Button
                  variant="primary"
                  leftIcon={<Check className="w-4 h-4" />}
                  onClick={() => handleApprove(previewItem)}
                  isLoading={submittingId === previewItem.id}
                >
                  Setujui Pembayaran
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Reject Reason Confirmation Modal */}
      {rejectingItem && (
        <Modal
          isOpen={Boolean(rejectingItem)}
          onClose={() => {
            setRejectingItem(null);
            setRejectionReason('');
            setRejectError(null);
          }}
          title="Tolak Pembayaran Tiket"
          description={`Tiket ${rejectingItem.ticketCode} atas nama ${rejectingItem.name}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="w-full flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Alasan Penolakan (Wajib minimal 10 karakter)
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Bukti transfer buram, nominal transfer tidak sesuai tiket..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className={`w-full p-3 border rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-all ${
                  rejectError
                    ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                <span>Minimal 10 karakter</span>
                <span className={rejectionReason.length < 10 ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                  {rejectionReason.length} / 10
                </span>
              </div>
              {rejectError && (
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{rejectError}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setRejectingItem(null);
                  setRejectionReason('');
                  setRejectError(null);
                }}
              >
                Batal
              </Button>

              <Button
                variant="danger"
                size="sm"
                leftIcon={<X className="w-4 h-4" />}
                onClick={handleConfirmReject}
                isLoading={submittingId === rejectingItem.id}
              >
                Konfirmasi Penolakan
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentReviewPage;
