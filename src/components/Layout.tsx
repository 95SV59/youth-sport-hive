import React, { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';

interface LayoutProps {
  children: ReactNode;
  requiredRoles?: string[];
}

const Layout = ({ children, requiredRoles }: LayoutProps) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Add timeout for loading state to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setTimeoutReached(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [loading]);

  // Show loading state briefly
  if (loading && !timeoutReached) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in or timeout reached
  if (!user || (timeoutReached && loading)) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based access if required roles are specified
  if (requiredRoles && requiredRoles.length > 0 && profile) {
    const hasAccess = requiredRoles.includes(profile.role);
    if (!hasAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
