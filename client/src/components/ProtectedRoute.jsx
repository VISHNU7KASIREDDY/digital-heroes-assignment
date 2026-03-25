import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export const AdminRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" />;
};
