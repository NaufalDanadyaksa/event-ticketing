import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  CalendarDays,
  Sparkles,
  Ticket,
  ShieldCheck,
  Zap,
  Filter,
} from 'lucide-react';
import { IEventListItem } from 'shared';
import { eventsApi } from '@/services/api/events.api';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/ui/Button';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<IEventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  const fetchEvents = async (searchQuery?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await eventsApi.listEvents({
        search: searchQuery || undefined,
        limit: 50,
      });
      setEvents(response.data || []);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Gagal memuat daftar event. Silakan coba kembali.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents(searchTerm.trim());
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchEvents('');
  };

  // Filtered by price tab
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (priceFilter === 'free') return !ev.isPaid;
      if (priceFilter === 'paid') return ev.isPaid;
      return true;
    });
  }, [events, priceFilter]);

  return (
    <div className="min-h-full pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-100/50 via-sky-50/40 to-transparent">
        {/* Subtle decorative background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-sky-300/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 border border-blue-300/60 text-blue-800 text-xs font-semibold shadow-sm backdrop-blur-sm animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Platform Tiket & Absensi Dinamis Modern</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight">
            Temukan & Hadiri Event{' '}
            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 bg-clip-text text-transparent">
              Terbaik Masa Kini
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Daftarkan diri Anda, peroleh e-tiket digital ber-QR instan, dan lakukan verifikasi
            kehadiran langsung dengan teknologi absensi dinamis rotasi 10 detik.
          </p>

          {/* Search Box Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto mt-8 flex flex-col sm:flex-row items-center gap-3 p-2 bg-white/85 backdrop-blur-md border border-blue-200/80 rounded-2xl sm:rounded-full shadow-lg"
          >
            <div className="relative flex-1 w-full flex items-center">
              <Search className="w-5 h-5 text-blue-500 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari judul event, pembicara, atau lokasi..."
                className="w-full pl-12 pr-10 py-3 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Hapus pencarian"
                  className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full sm:w-auto px-6 shrink-0"
              leftIcon={<Search className="w-4 h-4" />}
            >
              Cari Event
            </Button>
          </form>

          {/* Feature Highlights Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-blue-600" />
              <span>E-Tiket Digital Instan</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-sky-500" />
              <span>Absensi Rotasi 10 Detik</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verifikasi Gate Terenkripsi</span>
            </div>
          </div>
        </div>
      </section>

      {/* Event Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Section Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-blue-200/50">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Event Mendatang
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pilih event yang ingin Anda ikuti dan amankan tiket Anda sekarang
            </p>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex items-center p-1 rounded-full bg-white/80 border border-blue-200/70 shadow-sm self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setPriceFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                priceFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setPriceFilter('free')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                priceFilter === 'free'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Gratis
            </button>
            <button
              type="button"
              onClick={() => setPriceFilter('paid')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                priceFilter === 'paid'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Berbayar
            </button>
          </div>
        </div>

        {/* Loading State: Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white/70 backdrop-blur-md border border-blue-100 rounded-3xl p-4 shadow-sm space-y-4 animate-pulse"
              >
                <div className="w-full h-44 bg-blue-100/60 rounded-2xl" />
                <div className="h-5 bg-blue-100/80 rounded-md w-3/4" />
                <div className="space-y-2">
                  <div className="h-3.5 bg-blue-50 rounded w-full" />
                  <div className="h-3.5 bg-blue-50 rounded w-2/3" />
                </div>
                <div className="pt-2 border-t border-blue-50 flex justify-between">
                  <div className="h-4 bg-blue-100/60 rounded w-1/3" />
                  <div className="h-4 bg-blue-100/60 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMessage && (
          <div className="max-w-md mx-auto my-12 p-6 bg-red-50/80 border border-red-200/80 rounded-3xl text-center shadow-card">
            <p className="text-sm font-semibold text-red-700">{errorMessage}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchEvents()}
              className="mt-4"
            >
              Muat Ulang
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMessage && filteredEvents.length === 0 && (
          <div className="max-w-md mx-auto my-16 p-8 text-center bg-white/60 backdrop-blur-md border border-blue-200/50 rounded-3xl shadow-card">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <CalendarDays className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Tidak Ada Event Ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {searchTerm
                ? `Tidak ada hasil pencarian untuk "${searchTerm}". Silakan coba kata kunci lain.`
                : 'Belum ada event yang dipublikasikan saat ini. Kunjungi kembali nanti.'}
            </p>
            {searchTerm && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearSearch}
                className="mt-4"
              >
                Hapus Pencarian
              </Button>
            )}
          </div>
        )}

        {/* Event Cards Grid */}
        {!isLoading && !errorMessage && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelect={() => navigate(`/events/${event.slug}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
