'use client';

import React from 'react';
import { LanguageProvider } from '@/src/context/LanguageContext';
import { AuthProvider } from '@/src/context/AuthContext';
import StartupLoader from '@/src/components/StartupLoader';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <StartupLoader />
      <AuthProvider>
        {children}
      </AuthProvider>
    </LanguageProvider>
  );
}
