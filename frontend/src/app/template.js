// src/app/template.js
"use client";

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';

export default function Template({ children }) {
  const pathname = usePathname();
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsAdminRoute(pathname?.startsWith('/admin') || false);
  }, [pathname]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <>
        <div style={{ visibility: 'hidden' }}>
          {children}
        </div>
      </>
    );
  }
  
  return (
    <>
      {!isAdminRoute && <Header />}
      <main>{children}</main>
      {!isAdminRoute && <Footer />}
    </>
  );
}