import Link from 'next/link';

export const metadata = {
  title: 'Offline — VANTEGE WEAR',
};

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: '#050505',
        color: '#f5f5f5',
        textAlign: 'center',
        padding: 24,
      }}
    >
      <h1 style={{ fontSize: 28, letterSpacing: 2 }}>VANTEGE WEAR</h1>
      <p style={{ opacity: 0.7 }}>Internet aloqasi yo&apos;q. Ilova offline rejimda ishlayapti.</p>
      <Link
        href="/"
        style={{
          padding: '10px 20px',
          border: '1px solid #f5f5f5',
          borderRadius: 999,
          color: '#f5f5f5',
          textDecoration: 'none',
        }}
      >
        Qayta urinish
      </Link>
    </main>
  );
}
