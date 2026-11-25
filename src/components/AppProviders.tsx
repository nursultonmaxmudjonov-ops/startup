'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { LanguageProvider } from '@/src/context/LanguageContext';
import { AuthProvider } from '@/src/context/AuthContext';
import StartupLoader from '@/src/components/StartupLoader';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Loader faqat bosh sahifada ko'rsatiladi
  const isHome = pathname === '/';

  return (
    <LanguageProvider>
      {isHome && <StartupLoader />}
      <AuthProvider>{children}</AuthProvider>
    </LanguageProvider>
  );
}
