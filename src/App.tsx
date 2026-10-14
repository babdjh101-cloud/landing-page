import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { Storefront } from './pages/Storefront';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { getAdminSession } from './lib/api';

function getInitialRoute(): 'store' | 'admin' {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.includes('/admin') || hash === '#admin' ? 'admin' : 'store';
  }
  return 'store';
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<'store' | 'admin'>(getInitialRoute);
  const [adminUser, setAdminUser] = useState<{ id: number; username: string } | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check existing admin session on mount
  useEffect(() => {
    getAdminSession()
      .then((res) => {
        if (res.success && res.data?.user) {
          setAdminUser(res.data.user);
        }
      })
      .finally(() => setCheckingSession(false));

    const handleRouteChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash === '#admin') {
        setCurrentRoute('admin');
      } else {
        setCurrentRoute('store');
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const navigateToStore = () => {
    setCurrentRoute('store');
    window.history.pushState({}, '', '/');
  };

  return (
    <CartProvider>
      {currentRoute === 'admin' ? (
        checkingSession ? (
          <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-xs">
            সেশন যাচাই করা হচ্ছে...
          </div>
        ) : adminUser ? (
          <AdminDashboard
            user={adminUser}
            onLogout={() => setAdminUser(null)}
            onBackToStore={navigateToStore}
          />
        ) : (
          <AdminLogin
            onLoginSuccess={(u) => setAdminUser(u)}
            onBackToStore={navigateToStore}
          />
        )
      ) : (
        <Storefront />
      )}
    </CartProvider>
  );
}
