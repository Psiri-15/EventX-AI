import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Verifying authentication session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-800/80 border border-rose-500/30 rounded-2xl text-center">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-slate-400 text-sm mb-6">
          Your current account role (<span className="text-rose-400 font-semibold uppercase">{user.role}</span>) does not have authorization to view this dashboard page.
        </p>
        <a
          href="/"
          className="inline-block px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition shadow-lg shadow-brand-500/20 text-sm"
        >
          Return to Home
        </a>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
