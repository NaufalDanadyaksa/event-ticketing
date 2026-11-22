import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Role } from 'shared';
import { useAuthStore } from '@/store/authStore';

export interface PrivateRouteProps {
  allowedRoles?: Role[];
  children?: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === Role.ADMIN) {
      return <Navigate to="/admin/events" replace />;
    }
    if (user.role === Role.STAFF) {
      return <Navigate to="/staff/scan" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
