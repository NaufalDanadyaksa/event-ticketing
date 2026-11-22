import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Role } from 'shared';
import { AlertCircle, Home } from 'lucide-react';

// Layouts
import { AdminLayout } from '@/layouts/AdminLayout';
import { StaffLayout } from '@/layouts/StaffLayout';
import { PublicLayout } from '@/layouts/PublicLayout';

// Guards
import { PrivateRoute } from '@/components/PrivateRoute';

// Public & Attendee Pages
import { HomePage } from '@/pages/public/HomePage';
import { EventDetailPage } from '@/pages/public/EventDetailPage';
import { RegisterPage } from '@/pages/public/RegisterPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterAccountPage } from '@/pages/auth/RegisterAccountPage';
import { MyTicketsPage } from '@/pages/attendee/MyTicketsPage';
import { DigitalTicketPage } from '@/pages/attendee/DigitalTicketPage';

// Admin & Staff Pages
import { EventListPage } from '@/pages/admin/EventListPage';
import { EventFormPage } from '@/pages/admin/EventFormPage';
import { PaymentReviewPage } from '@/pages/admin/PaymentReviewPage';
import { VenuePresenterPage } from '@/pages/admin/VenuePresenterPage';
import { GateScannerPage } from '@/pages/staff/GateScannerPage';

// 404 Not Found Page Component
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/70 backdrop-blur-md border border-blue-200/60 rounded-3xl p-8 text-center shadow-card space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-100/70 text-blue-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">404 - Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Halaman yang Anda tuju tidak ditemukan atau telah dipindahkan.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================================================
            PUBLIC & ATTENDEE ROUTES (PublicLayout)
            ========================================================= */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/events/:slug" element={<EventDetailPage />} />
          <Route path="/events/:slug/register" element={<RegisterPage />} />
          <Route path="/ticket/:magicToken" element={<DigitalTicketPage />} />
          <Route path="/tickets/:magicToken" element={<DigitalTicketPage />} />

          {/* Attendee Protected Ticket Management */}
          <Route
            path="/my-tickets"
            element={
              <PrivateRoute allowedRoles={[Role.USER, Role.ADMIN, Role.STAFF]}>
                <MyTicketsPage />
              </PrivateRoute>
            }
          />
        </Route>

        {/* =========================================================
            AUTH ROUTES
            ========================================================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterAccountPage />} />
        <Route path="/register-account" element={<RegisterAccountPage />} />

        {/* =========================================================
            STAFF ROUTES (StaffLayout)
            ========================================================= */}
        <Route
          path="/staff"
          element={
            <PrivateRoute allowedRoles={[Role.STAFF, Role.ADMIN]}>
              <StaffLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/staff/scan" replace />} />
          <Route path="scan" element={<GateScannerPage />} />
        </Route>

        {/* =========================================================
            ADMIN ROUTES (AdminLayout & Fullscreen Presenter)
            ========================================================= */}
        {/* Fullscreen Venue Presenter (No sidebar layout for projector display) */}
        <Route
          path="/admin/events/:id/presenter"
          element={
            <PrivateRoute allowedRoles={[Role.ADMIN]}>
              <VenuePresenterPage />
            </PrivateRoute>
          }
        />

        {/* Standard Admin Management Layout */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={[Role.ADMIN]}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/admin/events" replace />} />
          <Route path="events" element={<EventListPage />} />
          <Route path="events/new" element={<EventFormPage />} />
          <Route path="events/:id/edit" element={<EventFormPage />} />
          <Route path="payments" element={<PaymentReviewPage />} />
        </Route>

        {/* 404 Catch-All Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
