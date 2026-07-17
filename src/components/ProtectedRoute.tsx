import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spinner } from './ui/Spinner';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-page">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const { profile, loading } = useAuth();
  if (loading) return <div className="auth-page"><Spinner /></div>;
  if (profile?.role !== 'admin') return <Navigate to="/account" replace />;
  return <Outlet />;
}
