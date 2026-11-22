import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import {
  ScanLine,
  LogOut,
  User,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Role } from 'shared';

export const StaffLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-slate-100 flex flex-col">
      {/* Minimal Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-blue-900/40 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shadow-md">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Gate Scanner Staff</h1>
            <p className="text-xs text-sky-400 font-medium">Verifikasi Check-in Peserta</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === Role.ADMIN && (
            <Link
              to="/admin/events"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-sky-300 bg-sky-950/60 border border-sky-800/60 hover:bg-sky-900/60 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Admin</span>
            </Link>
          )}

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold text-slate-200">{user?.name || 'Staff'}</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {user?.role || 'STAFF'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Keluar"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-300 bg-rose-950/50 border border-rose-900/60 hover:bg-rose-900/60 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;
