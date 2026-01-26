import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, role, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user has any role (admin or staff)
  if (role !== 'admin' && role !== 'staff') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-2">Kein Zugriff</h1>
          <p className="text-muted-foreground mb-4">
            Sie haben keine Berechtigung für den Admin-Bereich.
          </p>
          <a href="/" className="text-gold hover:underline">
            Zurück zur Website
          </a>
        </div>
      </div>
    );
  }

  // Check for admin-only routes
  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
