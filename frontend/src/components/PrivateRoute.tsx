import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute: React.FC = () => {
  const { user, loading } = useAuth();

  // Show premium loading spinner while checking authentication state
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-indigo-500">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-indigo-500 border-indigo-950"></div>
          <p className="text-sm font-medium animate-pulse">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
