import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Plus,
  Search,
  Pencil,
  Eye,
  EyeOff,
  Monitor,
  ExternalLink,
  MapPin,
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { getImageUrl } from '@/utils/imageUrl';
import type { IEvent } from 'shared';

export const EventListPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await adminApi.listAdminEvents();
      if (res.success && res.data) {
        setEvents(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat daftar event';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleTogglePublish = async (event: IEvent) => {
    try {
      setActionLoadingId(event.id);
      const res = await adminApi.togglePublish(event.id);
      if (res.success) {
        setEvents((prev) =>
          prev.map((e) => (e.id === event.id ? { ...e, isPublished: !e.isPublished } : e))
        );
        setFeedback({
          type: 'success',
          message: `Status event "${event.title}" berhasil diubah menjadi ${
            !event.isPublished ? 'Dipublikasikan' : 'Draft'
          }`,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status publikasi event';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.slug.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'published') return event.isPublished;
      if (statusFilter === 'draft') return !event.isPublished;
      return true;
    });
  }, [events, searchQuery, statusFilter]);

  const formatDate = (dateVal: Date | string) => {
    try {
      return new Date(dateVal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(dateVal);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-blue-600" />
            <span>Manajemen Event</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola seluruh jadwal, kuota, publikasi, dan layar presenter absensi event Anda.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/admin/events/new')}
          className="shadow-blue-500/25"
        >
          Tambah Event Baru
        </Button>
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

      {/* Filter and Search Bar */}
      <Card variant="glass" className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan judul, lokasi, atau slug event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-blue-200 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-blue-100/60 rounded-full shrink-0">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({events.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('published')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === 'published'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dipublikasikan ({events.filter((e) => e.isPublished).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('draft')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === 'draft'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Draft ({events.filter((e) => !e.isPublished).length})
            </button>
          </div>
        </div>
      </Card>

      {/* Events Table / Card List */}
      <Card variant="glass" className="overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Spinner size="lg" variant="primary" />
            <p className="text-sm font-semibold">Memuat data event...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 rounded-3xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
              <CalendarDays className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Tidak ada event ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {searchQuery
                ? 'Tidak ada event yang sesuai dengan kriteria pencarian Anda.'
                : 'Belum ada event yang dibuat. Mulai buat event pertama Anda sekarang!'}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/admin/events/new')}
                className="mt-2"
              >
                Buat Event
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-blue-100 bg-blue-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Event</th>
                  <th className="py-3.5 px-4">Waktu & Lokasi</th>
                  <th className="py-3.5 px-4">Biaya</th>
                  <th className="py-3.5 px-4">Kapasitas</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50 text-sm">
                {filteredEvents.map((event) => {
                  const isActionLoading = actionLoadingId === event.id;
                  return (
                    <tr
                      key={event.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* Event Banner & Title */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-100 to-sky-100 border border-blue-200/80 overflow-hidden flex items-center justify-center shrink-0">
                            {event.bannerUrl ? (
                              <img
                                src={getImageUrl(event.bannerUrl)}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <CalendarDays className="w-6 h-6 text-blue-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-xs sm:max-w-sm">
                              {event.title}
                            </p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                              /{event.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Time & Location */}
                      <td className="py-4 px-4 text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{formatDate(event.eventStartDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{event.location}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4">
                        {event.isPaid ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Rp {Number(event.price).toLocaleString('id-ID')}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            Gratis
                          </span>
                        )}
                      </td>

                      {/* Capacity */}
                      <td className="py-4 px-4 text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {event.maxParticipants > 0
                              ? `${event.maxParticipants} peserta`
                              : 'Tidak Terbatas'}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        {event.isPublished ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Dipublikasikan</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>Draft</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Presenter Screen Link */}
                          <Link
                            to={`/admin/events/${event.id}/presenter`}
                            title="Buka Layar Absensi Presenter"
                            className="p-2 rounded-xl text-sky-600 hover:bg-sky-50 border border-sky-200/60 transition-colors"
                          >
                            <Monitor className="w-4 h-4" />
                          </Link>

                          {/* Edit Event */}
                          <Link
                            to={`/admin/events/${event.id}/edit`}
                            title="Edit Event"
                            className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 border border-blue-200/60 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>

                          {/* Toggle Publish */}
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleTogglePublish(event)}
                            title={event.isPublished ? 'Ubah ke Draft' : 'Publikasikan Event'}
                            className={`p-2 rounded-xl border transition-colors ${
                              event.isPublished
                                ? 'text-amber-600 hover:bg-amber-50 border-amber-200/60'
                                : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200/60'
                            }`}
                          >
                            {isActionLoading ? (
                              <Spinner size="sm" variant="primary" />
                            ) : event.isPublished ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>

                          {/* Public Detail Link */}
                          <Link
                            to={`/events/${event.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Lihat Halaman Publik Event"
                            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 border border-slate-200/60 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EventListPage;
