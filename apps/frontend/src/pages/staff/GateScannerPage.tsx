import React, { useState, useRef } from 'react';
import {
  ScanLine,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Ticket,
  User,
  History,
  Send,
  RefreshCw,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { staffApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QRScanner } from '@/components/QRScanner';
import { Spinner } from '@/components/ui/Spinner';
import type { IRegistration, IEvent } from 'shared';

interface ScanHistoryItem {
  id: string;
  ticketCode: string;
  name: string;
  time: string;
  success: boolean;
  message?: string;
}

export const GateScannerPage: React.FC = () => {
  const [manualCode, setManualCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  // Scan feedback overlay state
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
    registration?: IRegistration;
    event?: IEvent | null;
  } | null>(null);

  // Scan debounce / pause
  const [isPaused, setIsPaused] = useState(false);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerFeedback = (
    type: 'success' | 'error',
    title: string,
    message: string,
    registration?: IRegistration,
    event?: IEvent | null
  ) => {
    setIsPaused(true);
    setFeedback({ type, title, message, registration, event });

    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }

    // Auto resume scanner after 3.5 seconds
    dismissTimerRef.current = setTimeout(() => {
      setFeedback(null);
      setIsPaused(false);
    }, 3500);
  };

  const handleManualDismiss = () => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
    setFeedback(null);
    setIsPaused(false);
  };

  const processCheckIn = async (rawCode: string) => {
    if (processing || isPaused) return;

    const trimmedCode = rawCode.trim();
    if (!trimmedCode) return;

    try {
      setProcessing(true);
      const res = await staffApi.checkIn(trimmedCode);

      if (res.success && res.data) {
        const reg = res.data.registration;
        const ev = res.data.event;

        setSessionCount((prev) => prev + 1);

        const newHistoryItem: ScanHistoryItem = {
          id: reg.id,
          ticketCode: reg.ticketCode,
          name: reg.name,
          time: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          success: true,
          message: 'Berhasil Check-In',
        };
        setHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]);

        triggerFeedback(
          'success',
          'Check-In Berhasil!',
          res.message || 'Peserta berhasil diverifikasi masuk ke venue.',
          reg,
          ev
        );
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Gagal verifikasi tiket. Pastikan kode tiket terdaftar.';

      const newHistoryItem: ScanHistoryItem = {
        id: String(Date.now()),
        ticketCode: trimmedCode,
        name: 'Tidak Diketahui',
        time: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        success: false,
        message: errorMsg,
      };
      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]);

      triggerFeedback('error', 'Check-In Gagal', errorMsg);
    } finally {
      setProcessing(false);
      setManualCode('');
    }
  };

  const handleCameraScan = (decodedText: string) => {
    processCheckIn(decodedText);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processCheckIn(manualCode.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      {/* Session Counter Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-blue-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-sky-400 flex items-center justify-center">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Sesi Check-In Aktif</p>
              <p className="text-xl font-extrabold text-white font-mono">
                {sessionCount} <span className="text-xs font-normal text-slate-400">tiket</span>
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Scanner Siap
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-blue-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Validasi Gate</p>
              <p className="text-sm font-bold text-slate-200">Kamera & Kode Tiket Manual</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Camera Scanner & Manual Input (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <div className="relative p-6 rounded-3xl bg-slate-900/90 border border-blue-900/60 shadow-xl overflow-hidden">
            {/* Visual Scan Feedback Modal / Overlay */}
            {feedback && (
              <div
                onClick={handleManualDismiss}
                className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md cursor-pointer transition-all animate-fade-in ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/95 text-emerald-100 border-4 border-emerald-500'
                    : 'bg-rose-950/95 text-rose-100 border-4 border-rose-500'
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
                      : 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-10 h-10" />
                  ) : (
                    <XCircle className="w-10 h-10" />
                  )}
                </div>

                <h3 className="text-xl font-extrabold tracking-tight mb-1">
                  {feedback.title}
                </h3>
                <p className="text-sm opacity-90 max-w-xs">{feedback.message}</p>

                {feedback.registration && (
                  <div className="mt-4 p-3 rounded-2xl bg-black/20 border border-white/10 w-full max-w-xs text-left space-y-1">
                    <p className="text-xs font-semibold text-emerald-300">
                      Nama: <span className="text-white font-bold">{feedback.registration.name}</span>
                    </p>
                    <p className="text-xs font-semibold text-emerald-300">
                      Kode Tiket:{' '}
                      <span className="font-mono text-white font-bold">
                        {feedback.registration.ticketCode}
                      </span>
                    </p>
                    {feedback.event && (
                      <p className="text-xs font-semibold text-emerald-300 truncate">
                        Event: <span className="text-white font-normal">{feedback.event.title}</span>
                      </p>
                    )}
                  </div>
                )}

                <p className="text-[11px] opacity-60 mt-4">
                  Ketuk di mana saja untuk lanjut memindai
                </p>
              </div>
            )}

            {/* Camera QRScanner Component */}
            <QRScanner
              onScan={handleCameraScan}
              paused={isPaused || processing}
              fps={10}
              qrbox={240}
            />
          </div>

          {/* Manual Input Fallback */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-blue-900/60 shadow-lg">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2 flex items-center gap-1.5">
              <Ticket className="w-4 h-4" />
              <span>Input Manual Kode Tiket</span>
            </h4>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Contoh: TIC-9A3F-4B2E"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                disabled={processing}
                className="flex-1 px-4 py-2.5 rounded-full text-sm font-mono uppercase bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={processing}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Check In
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Scan History Feed (5 cols) */}
        <div className="md:col-span-5 p-5 rounded-3xl bg-slate-900/80 border border-blue-900/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <History className="w-4 h-4" />
              <span>Riwayat Pemindaian Sesi Ini</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono">{history.length} data</span>
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Belum ada riwayat scan pada sesi ini. Arahkan kamera tiket peserta untuk memulai.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {history.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-colors ${
                    item.success
                      ? 'bg-slate-800/80 border-emerald-900/40 text-slate-200'
                      : 'bg-rose-950/40 border-rose-900/40 text-rose-200'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      {item.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="font-bold truncate text-white">{item.name}</span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-400">{item.ticketCode}</p>
                    {item.message && !item.success && (
                      <p className="text-[10px] text-rose-300 truncate">{item.message}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GateScannerPage;
