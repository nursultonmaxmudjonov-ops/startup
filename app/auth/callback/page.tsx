'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/src/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      router.replace('/');
      return;
    }

    let isMounted = true;

    async function handleAuth() {
      if (typeof window === 'undefined') return;

      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');

      // PKCE oAuth flow orqali kelgan kodni sessiyaga almashtirish
      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('exchangeCodeForSession xatosi:', error);
            if (isMounted) {
              setStatus('error');
              setErrorMsg(error.message);
              setTimeout(() => router.replace('/'), 3500);
            }
            return;
          }
          if (isMounted) {
            setStatus('success');
            setTimeout(() => router.replace('/'), 700);
          }
          return;
        } catch (err: unknown) {
          console.error('Code exchange xatosi:', err);
        }
      }

      // Hash fragment yoki mavjud sessiyani tekshirish
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (!isMounted) return;
        if (error) {
          setStatus('error');
          setErrorMsg(error.message);
          setTimeout(() => router.replace('/'), 3000);
          return;
        }

        if (session) {
          setStatus('success');
          setTimeout(() => router.replace('/'), 700);
        } else {
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange((_event, s) => {
            if (!isMounted) return;
            if (s) {
              subscription.unsubscribe();
              setStatus('success');
              setTimeout(() => router.replace('/'), 700);
            }
          });

          const timer = setTimeout(() => {
            if (isMounted) router.replace('/');
          }, 4500);

          return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
          };
        }
      });
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d0e10',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          background: '#141518',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '18px',
          padding: '36px 48px',
          textAlign: 'center',
          maxWidth: '440px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: status === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
            border: status === 'error' ? '1px solid #ef4444' : '1px solid #22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            fontSize: '22px',
          }}
        >
          {status === 'loading' ? '⚡' : status === 'success' ? '✓' : '✕'}
        </div>

        <h2 style={{ fontSize: '1.25rem', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
          {status === 'loading'
            ? 'Supabase orqali kirilmoqda…'
            : status === 'success'
            ? 'Muvaffaqiyatli kirdingiz!'
            : 'Kirishda xatolik yuz berdi'}
        </h2>

        <p style={{ color: '#8a8f98', fontSize: '0.86rem', margin: '0 0 16px', lineHeight: 1.5 }}>
          {status === 'error'
            ? errorMsg || 'Autentifikatsiya ma’lumotlarini tekshirib bo‘lmadi.'
            : 'VANTEGE WEAR Cloud Passport tizimiga yo‘naltirilmoqda…'}
        </p>

        {status === 'loading' && (
          <div
            style={{
              width: '100%',
              height: '3px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '99px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '60%',
                height: '100%',
                background: '#22c55e',
                borderRadius: '99px',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
