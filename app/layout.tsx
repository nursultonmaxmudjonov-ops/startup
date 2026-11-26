import type { Metadata, Viewport } from 'next';
import './globals.css';
import '@/src/styles/startup-suite.css';
import AppProviders from '@/src/components/AppProviders';
import PWARegister from '@/src/components/PWARegister';
import InstallPrompt from '@/src/components/InstallPrompt';

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  applicationName: 'VANTEGE',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VANTEGE',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
  formatDetection: {
    telephone: false,
  },
  title: 'VANTEGE WEAR Shell — Next-Gen Outerwear & Virtual Studio',
  description: 'Six looks, styled head to toe. Tap a pin to see the piece. Powered by 3L graphene membranes and neural spatial fitting.',
  openGraph: {
    title: 'VANTEGE WEAR Shell — Shop the Look & Virtual Studio',
    description: 'Six looks, styled head to toe. Nanotech outerwear startup archive.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#050505',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </head>
      <body>
        <AppProviders>
          <PWARegister />
          <InstallPrompt />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
