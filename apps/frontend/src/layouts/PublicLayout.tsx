import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Ticket,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  TicketCheck,
  ShieldCheck,
  ScanLine,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Role } from 'shared';

export const PublicLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-sky-50/50 to-blue-100/40 text-slate-800">
      {/* Sticky Glass Navbar */}
      <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-md border-b border-blue-200/50 transition-all shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Ticket className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 bg-clip-text text-transparent leading-tight tracking-tight">
                  EventHub
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                  Tiket & Absensi
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-100/70 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/60'
                  }`
                }
              >
                Beranda
              </NavLink>

              {isAuthenticated && (
                <NavLink
                  to="/my-tickets"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors ${
                      isActive
                        ? 'bg-blue-100/70 text-blue-700 font-bold'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/60'
                    }`
                  }
                >
                  <TicketCheck className="w-4 h-4 text-blue-500" />
                  <span>Tiket Saya</span>
                </NavLink>
              )}

              {/* Quick links for Staff & Admin */}
              {isAuthenticated && user?.role === Role.ADMIN && (
                <Link
                  to="/admin/events"
                  className="px-3.5 py-1.5 ml-2 rounded-full text-xs font-semibold text-blue-700 bg-blue-100/80 border border-blue-300/60 hover:bg-blue-200/80 flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Admin Portal</span>
                </Link>
              )}

              {isAuthenticated && (user?.role === Role.STAFF || user?.role === Role.ADMIN) && (
                <Link
                  to="/staff/scan"
                  className="px-3.5 py-1.5 ml-1 rounded-full text-xs font-semibold text-sky-700 bg-sky-100/80 border border-sky-300/60 hover:bg-sky-200/80 flex items-center gap-1.5 transition-colors"
                >
                  <ScanLine className="w-3.5 h-3.5 text-sky-600" />
                  <span>Gate Scanner</span>
                </Link>
              )}
            </nav>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-blue-200/70 hover:border-blue-300 transition-colors shadow-sm text-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="font-semibold text-slate-800 max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md border border-blue-200/80 rounded-2xl shadow-xl py-2 z-50 animate-fade-in"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-blue-100/60">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {user.role}
                        </span>
                      </div>

                      <Link
                        to="/my-tickets"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <TicketCheck className="w-4 h-4 text-blue-500" />
                        <span>Tiket Saya</span>
                      </Link>

                      {user.role === Role.ADMIN && (
                        <Link
                          to="/admin/events"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span>Panel Admin</span>
                        </Link>
                      )}

                      {(user.role === Role.ADMIN || user.role === Role.STAFF) && (
                        <Link
                          to="/staff/scan"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          <ScanLine className="w-4 h-4 text-sky-600" />
                          <span>Gate Scanner</span>
                        </Link>
                      )}

                      <div className="border-t border-blue-100/60 my-1" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-blue-700 hover:bg-blue-100/60 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk</span>
                  </Link>

                  <Link
                    to="/register-account"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-sky-500 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Daftar Akun</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
                className="p-2 rounded-xl text-slate-700 hover:bg-blue-100/60 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-blue-200/50 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-fade-in">
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'bg-blue-100/70 text-blue-700'
                    : 'text-slate-700 hover:bg-blue-50'
                }`
              }
            >
              Beranda
            </NavLink>

            {isAuthenticated && (
              <NavLink
                to="/my-tickets"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive
                      ? 'bg-blue-100/70 text-blue-700'
                      : 'text-slate-700 hover:bg-blue-50'
                  }`
                }
              >
                <TicketCheck className="w-4 h-4 text-blue-500" />
                <span>Tiket Saya</span>
              </NavLink>
            )}

            {isAuthenticated && user?.role === Role.ADMIN && (
              <Link
                to="/admin/events"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Admin Portal</span>
              </Link>
            )}

            {isAuthenticated && (user?.role === Role.ADMIN || user?.role === Role.STAFF) && (
              <Link
                to="/staff/scan"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-sky-700 bg-sky-50"
              >
                <ScanLine className="w-4 h-4 text-sky-600" />
                <span>Gate Scanner Staff</span>
              </Link>
            )}

            <div className="border-t border-blue-100 pt-3">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="px-3 py-1">
                    <p className="text-xs font-bold text-slate-800">{user.name}</p>
                    <p className="text-[11px] text-slate-500">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk</span>
                  </Link>
                  <Link
                    to="/register-account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-sky-500 shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Daftar</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-blue-200/50 bg-white/50 backdrop-blur-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-sm">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm">EventHub Platform</span>
                <p className="text-xs text-slate-500">
                  Sistem Tiket Digital & Verifikasi Absensi Dinamis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-600 font-medium">
              <Link to="/" className="hover:text-blue-600 transition-colors">
                Event
              </Link>
              <Link to="/my-tickets" className="hover:text-blue-600 transition-colors">
                Tiket Saya
              </Link>
              <Link to="/login" className="hover:text-blue-600 transition-colors">
                Masuk
              </Link>
            </div>

            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} EventHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
