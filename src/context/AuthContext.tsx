'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getSupabaseClient,
  getSupabaseConfig,
  isSupabaseValid,
  setCustomSupabaseConfig,
  clearCustomSupabaseConfig,
} from '@/src/lib/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  city: string;
  tier: string;
  joinedAt: string;
  avatar?: string;
  sizePreference?: string;
  authProvider?: 'password' | 'google' | 'telegram' | 'demo' | 'phone';
  phone?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image?: string;
}

export interface UserOrder {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber: string;
  shippingAddress: string;
}

interface StoredAccount {
  user: User;
  pass: string;
}

export interface TelegramUserData {
  id: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  orders: UserOrder[];
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'phone';
  isOrdersModalOpen: boolean;
  isSupabaseConnected: boolean;
  supabaseUrl: string;
  openAuthModal: (mode?: 'login' | 'register' | 'phone') => void;
  closeAuthModal: () => void;
  openOrdersModal: () => void;
  closeOrdersModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  isSettingsModalOpen: boolean;
  login: (email: string, pass: string) => { success: boolean; error?: string };
  loginWithPhone: (data: { phone: string; name: string; city?: string; size?: string }) => { success: boolean; user: User };
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithTelegram: (customTgUser?: TelegramUserData) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; pass: string; city: string; size?: string }) => { success: boolean; error?: string };
  updateProfile: (data: { name?: string; city?: string; sizePreference?: string; phone?: string }) => { success: boolean; error?: string };
  changePassword: (currentPass: string, newPass: string) => { success: boolean; error?: string };
  logout: () => Promise<void>;
  updateSupabaseCredentials: (url: string, anonKey: string) => boolean;
  resetSupabaseCredentials: () => void;
  addOrder: (items: OrderItem[], total: number, address: string) => UserOrder;
  updateOrderStatus: (orderId: string, status: UserOrder['status']) => void;
}

const DEFAULT_ADMIN: User = {
  id: 'usr_admin_01',
  name: 'Aziz Karimov',
  email: 'admin@vantegewear.com',
  role: 'admin',
  city: 'Tashkent',
  tier: 'FOUNDING ARCHITECT · ADMIN',
  joinedAt: '2024-01-15',
  sizePreference: 'L',
  authProvider: 'demo',
};

const DEFAULT_USER: User = {
  id: 'usr_client_02',
  name: 'Sitora Alimova',
  email: 'alex@vantegewear.com',
  role: 'user',
  city: 'Tashkent',
  tier: 'VANTEGE CLUB VIP · TIER 1',
  joinedAt: '2025-08-20',
  sizePreference: 'M',
  authProvider: 'demo',
};

const DEFAULT_ACCOUNTS: Record<string, StoredAccount> = {
  'admin@vantegewear.com': {
    user: DEFAULT_ADMIN,
    pass: 'admin123',
  },
  'alex@vantegewear.com': {
    user: DEFAULT_USER,
    pass: 'user123',
  },
};

const USERS_DB_KEY = 'vantegewear_users_db';

const getStoredAccounts = (): Record<string, StoredAccount> => {
  if (typeof window === 'undefined') return { ...DEFAULT_ACCOUNTS };
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_ACCOUNTS, ...parsed };
    }
  } catch {}
  return { ...DEFAULT_ACCOUNTS };
};

const saveStoredAccount = (email: string, user: User, pass: string) => {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredAccounts();
    current[email.toLowerCase()] = { user, pass };
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(current));
  } catch {}
};

const INITIAL_ORDERS: UserOrder[] = [
  {
    id: 'ORD-9281',
    date: '2026-11-12 21:40',
    total: 590,
    status: 'shipped',
    trackingNumber: 'UZ-EXP-9920141',
    shippingAddress: 'Tashkent, Shayxontohur tumani, Navoiy ko‘chasi 18',
    items: [
      { id: 'item-1', name: 'Cobalt Rain Shell', price: 425, size: 'L', quantity: 1 },
      { id: 'item-2', name: 'Wide Cargo Pant', price: 165, size: 'L', quantity: 1 },
    ],
  },
  {
    id: 'ORD-8812',
    date: '2026-10-28 14:15',
    total: 650,
    status: 'delivered',
    trackingNumber: 'UZ-EXP-8812300',
    shippingAddress: 'Samarkand, Dagbitskaya 42',
    items: [
      { id: 'item-3', name: 'Mirror Down Parka', price: 650, size: 'M', quantity: 1 },
    ],
  },
  {
    id: 'ORD-7504',
    date: '2026-09-04 18:02',
    total: 390,
    status: 'delivered',
    trackingNumber: 'KZ-EXP-440192',
    shippingAddress: 'Almaty, Dostyk ave. 85',
    items: [
      { id: 'item-4', name: 'Storm Hooded Shell', price: 390, size: 'S', quantity: 1 },
    ],
  },
];

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  orders: INITIAL_ORDERS,
  isAuthModalOpen: false,
  authModalMode: 'phone',
  isOrdersModalOpen: false,
  isSettingsModalOpen: false,
  isSupabaseConnected: false,
  supabaseUrl: '',
  openAuthModal: () => undefined,
  closeAuthModal: () => undefined,
  openOrdersModal: () => undefined,
  closeOrdersModal: () => undefined,
  openSettingsModal: () => undefined,
  closeSettingsModal: () => undefined,
  login: () => ({ success: false }),
  loginWithPhone: () => ({ success: false, user: DEFAULT_USER }),
  loginWithGoogle: async () => ({ success: false }),
  loginWithTelegram: async () => ({ success: false }),
  register: () => ({ success: false }),
  updateProfile: () => ({ success: false }),
  changePassword: () => ({ success: false }),
  logout: async () => undefined,
  updateSupabaseCredentials: () => false,
  resetSupabaseCredentials: () => undefined,
  addOrder: () => INITIAL_ORDERS[0],
  updateOrderStatus: () => undefined,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<UserOrder[]>(INITIAL_ORDERS);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'phone'>('phone');
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [currentSupabaseUrl, setCurrentSupabaseUrl] = useState('');

  // Supabase foydalanuvchisini ilova holatiga ulash
  const syncSupabaseUser = (
    sbUser: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string },
    provider: 'google' | 'telegram' = 'google'
  ) => {
    const meta = sbUser.user_metadata || {};
    const fullName =
      (meta.full_name as string) ||
      (meta.name as string) ||
      (meta.given_name ? `${meta.given_name} ${(meta.family_name as string) || ''}`.trim() : '') ||
      sbUser.email?.split('@')[0] ||
      (provider === 'telegram' ? 'Telegram Foydalanuvchisi' : 'Google Foydalanuvchisi');

    const cleanEmail = (sbUser.email || '').toLowerCase();
    const isAdminUser = cleanEmail === 'admin@vantegewear.com' || meta.role === 'admin';

    const appUser: User = {
      id: sbUser.id,
      name: fullName,
      email: cleanEmail,
      role: isAdminUser ? 'admin' : 'user',
      city: (meta.city as string) || 'Tashkent',
      tier: isAdminUser
        ? 'FOUNDING ARCHITECT · ADMIN'
        : provider === 'telegram'
        ? 'VANTEGE TELEGRAM CLUB · SUPABASE'
        : 'VANTEGE CLUB MEMBER · SUPABASE',
      joinedAt: sbUser.created_at ? sbUser.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
      avatar: (meta.avatar_url as string) || (meta.picture as string),
      authProvider: provider,
    };

    saveStoredAccount(cleanEmail, appUser, 'supabase_oauth');
    setUser(appUser);
    try {
      localStorage.setItem('vantegewear_user', JSON.stringify(appUser));
    } catch {}
    setIsAuthModalOpen(false);
  };

  useEffect(() => {
    // 1) Local storage dan foydalanuvchi va buyurtmalarni o'qish
    try {
      const savedUser = localStorage.getItem('vantegewear_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      const savedOrders = localStorage.getItem('vantegewear_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
      if (!localStorage.getItem(USERS_DB_KEY)) {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      }
    } catch {
      // ignore
    }

    // 2) Supabase ulanishini tekshirish
    const config = getSupabaseConfig();
    const isConn = isSupabaseValid(config);
    setSupabaseConnected(isConn);
    setCurrentSupabaseUrl(config.url);

    const client = getSupabaseClient();
    if (client) {
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const isTg =
            session.user.email?.includes('telegram') ||
            session.user.user_metadata?.provider === 'telegram';
          syncSupabaseUser(session.user, isTg ? 'telegram' : 'google');
        }
      });

      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const isTg =
            session.user.email?.includes('telegram') ||
            session.user.user_metadata?.provider === 'telegram';
          syncSupabaseUser(session.user, isTg ? 'telegram' : 'google');
        } else if (_event === 'SIGNED_OUT') {
          setUser(null);
          try {
            localStorage.removeItem('vantegewear_user');
          } catch {}
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const openAuthModal = (mode: 'login' | 'register' | 'phone' = 'phone') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openOrdersModal = () => setIsOrdersModalOpen(true);
  const closeOrdersModal = () => setIsOrdersModalOpen(false);
  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  // Telefon orqali SMS tasdiqlash bilan kirish/ro'yxatdan o'tish
  const loginWithPhone = (data: { phone: string; name: string; city?: string; size?: string }) => {
    const cleanPhone = data.phone.trim();
    const cleanName = data.name.trim();
    const cleanCity = data.city || 'Tashkent';
    const cleanSize = data.size || 'M';
    const cleanEmail = `${cleanPhone.replace(/\D/g, '')}@phone.vantegewear.com`;

    const newUser: User = {
      id: `usr_ph_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: 'user',
      city: cleanCity,
      tier: 'VANTEGE CLUB MEMBER · VERIFIED PHONE',
      joinedAt: new Date().toISOString().slice(0, 10),
      sizePreference: cleanSize,
      authProvider: 'phone',
    };

    saveStoredAccount(cleanEmail, newUser, 'phone_sms_verified');
    setUser(newUser);
    try {
      localStorage.setItem('vantegewear_user', JSON.stringify(newUser));
    } catch {}
    setIsAuthModalOpen(false);
    return { success: true, user: newUser };
  };

  // Email va parol orqali kirish (Demo admin yoki ro'yxatdan o'tgan foydalanuvchi)
  const login = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Email va parolni kiriting' };
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Iltimos, to‘g‘ri elektron pochta manzilini kiriting' };
    }

    const accounts = getStoredAccounts();
    const existing = accounts[cleanEmail];

    if (existing) {
      if (existing.pass === cleanPass) {
        setUser(existing.user);
        try {
          localStorage.setItem('vantegewear_user', JSON.stringify(existing.user));
        } catch {}
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, error: 'Kiritilgan parol noto‘g‘ri' };
    }

    // Yangi foydalanuvchi avtomatik hisob
    if (cleanPass.length >= 4) {
      const formattedName = cleanEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const customUser: User = {
        id: `usr_${Date.now()}`,
        name: formattedName || 'Mijoz',
        email: cleanEmail,
        role: cleanEmail.includes('admin') ? 'admin' : 'user',
        city: 'Tashkent',
        tier: cleanEmail.includes('admin') ? 'FOUNDING ARCHITECT · ADMIN' : 'VANTEGE CLUB MEMBER',
        joinedAt: new Date().toISOString().slice(0, 10),
        sizePreference: 'M',
        authProvider: 'password',
      };

      saveStoredAccount(cleanEmail, customUser, cleanPass);
      setUser(customUser);
      try {
        localStorage.setItem('vantegewear_user', JSON.stringify(customUser));
      } catch {}
      setIsAuthModalOpen(false);
      return { success: true };
    }

    return { success: false, error: 'Parol kamida 4 belgidan iborat bo‘lishi lozim' };
  };

  // Google orqali Supabase bilan kirish
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    const client = getSupabaseClient();

    if (client) {
      try {
        const redirectUrl =
          typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : undefined;

        const { error } = await client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        if (error) {
          return { success: false, error: `Supabase Google xatoligi: ${error.message}` };
        }
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Google tizimiga ulanishda xatolik';
        return { success: false, error: msg };
      }
    }

    // Supabase sozlanmagan bo'lsa
    return {
      success: false,
      error: 'Haqiqiy Google orqali kirish uchun Supabase ulanishi kerak! Iltimos, Supabase URL va Anon Key ni kiriting.',
    };
  };

  // Telegram orqali Supabase bilan kirish
  const loginWithTelegram = async (
    customTgUser?: TelegramUserData
  ): Promise<{ success: boolean; error?: string }> => {
    // 1) Telegram WebApp'dan foydalanuvchi ma'lumotlarini olish
    const tgWebApp =
      typeof window !== 'undefined'
        ? (window as unknown as {
            Telegram?: {
              WebApp?: {
                initDataUnsafe?: {
                  user?: {
                    id?: number;
                    first_name?: string;
                    last_name?: string;
                    username?: string;
                    photo_url?: string;
                  };
                };
              };
            };
          }).Telegram?.WebApp
        : undefined;

    const webUser = tgWebApp?.initDataUnsafe?.user;

    const tgUser: TelegramUserData = customTgUser || (webUser?.id
      ? {
          id: webUser.id,
          first_name: webUser.first_name,
          last_name: webUser.last_name,
          username: webUser.username,
          photo_url: webUser.photo_url,
        }
      : {
          id: 998901234,
          first_name: 'Telegram',
          last_name: 'Foydalanuvchisi',
          username: 'vantege_user',
        });

    const tgId = tgUser.id;
    const tgName =
      `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() ||
      tgUser.username ||
      `Foydalanuvchi_${tgId}`;

    const tgEmail = tgUser.username
      ? `${tgUser.username.toLowerCase()}@telegram.vantegewear.com`
      : `tg_${tgId}@telegram.vantegewear.com`;

    // Supabase uchun xavfsiz va bir xil parol
    const tgPassword = `TG_Auth_${tgId}_Vantege26!`;

    const client = getSupabaseClient();

    if (client) {
      try {
        // 1-qadam: Supabase'da ushbu Telegram akkaunt bilan kirishga urinish
        const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
          email: tgEmail,
          password: tgPassword,
        });

        if (signInData?.user) {
          syncSupabaseUser(signInData.user, 'telegram');
          return { success: true };
        }

        // 2-qadam: Agar hisob hali Supabase'da yo'q bo'lsa, ro'yxatdan o'tkazamiz
        if (signInErr) {
          const { data: signUpData, error: signUpErr } = await client.auth.signUp({
            email: tgEmail,
            password: tgPassword,
            options: {
              data: {
                full_name: tgName,
                username: tgUser.username || '',
                telegram_id: tgId,
                avatar_url: tgUser.photo_url || '',
                provider: 'telegram',
              },
            },
          });

          if (signUpData?.user) {
            syncSupabaseUser(signUpData.user, 'telegram');
            return { success: true };
          }

          if (signUpErr) {
            console.warn('Supabase Telegram signup:', signUpErr);
          }
        }
      } catch (err) {
        console.warn('Supabase Telegram ulanishida ogohlantirish:', err);
      }
    }

    // Supabase ulanmagan bo'lsa zaxira foydalanuvchi
    const tgAccount: User = {
      id: `usr_tg_${tgId}`,
      name: tgName,
      email: tgEmail,
      role: 'user',
      city: 'Tashkent',
      tier: 'VANTEGE TELEGRAM CLUB · SUPABASE',
      joinedAt: new Date().toISOString().slice(0, 10),
      avatar: tgUser.photo_url,
      sizePreference: 'L',
      authProvider: 'telegram',
    };

    saveStoredAccount(tgEmail, tgAccount, tgPassword);
    setUser(tgAccount);
    try {
      localStorage.setItem('vantegewear_user', JSON.stringify(tgAccount));
    } catch {}
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const register = (data: { name: string; email: string; pass: string; city: string; size?: string }) => {
    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPass = data.pass.trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      return { success: false, error: 'Barcha maydonlarni to‘ldiring' };
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'To‘g‘ri elektron pochta manzilini kiriting' };
    }

    if (cleanPass.length < 4) {
      return { success: false, error: 'Parol kamida 4 belgidan iborat bo‘lishi lozim' };
    }

    const accounts = getStoredAccounts();
    if (accounts[cleanEmail]) {
      return { success: false, error: 'Bu elektron pochta allaqachon ro‘yxatdan o‘tgan. Iltimos, kiring.' };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: cleanEmail.includes('admin') ? 'admin' : 'user',
      city: data.city || 'Tashkent',
      tier: 'VANTEGE CLUB VIP · TIER 1',
      joinedAt: new Date().toISOString().slice(0, 10),
      sizePreference: data.size || 'M',
      authProvider: 'password',
    };

    saveStoredAccount(cleanEmail, newUser, cleanPass);
    setUser(newUser);
    try {
      localStorage.setItem('vantegewear_user', JSON.stringify(newUser));
    } catch {}
    setIsAuthModalOpen(false);
    return { success: true };
  };

  // Profilni yangilash (ism, shahar, olcham, telefon)
  const updateProfile = (data: { name?: string; city?: string; sizePreference?: string; phone?: string }): { success: boolean; error?: string } => {
    if (!user) return { success: false, error: 'Avval tizimga kiring' };
    const updated: User = {
      ...user,
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.city !== undefined ? { city: data.city } : {}),
      ...(data.sizePreference !== undefined ? { sizePreference: data.sizePreference } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
    };
    setUser(updated);
    try {
      localStorage.setItem('vantegewear_user', JSON.stringify(updated));
      // Saqlangan hisobdagi profilni ham yangilash
      const accounts = getStoredAccounts();
      const key = user.email.toLowerCase();
      if (accounts[key]) {
        accounts[key].user = updated;
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(accounts));
      }
    } catch {}
    return { success: true };
  };

  // Parolni ozgartirish
  const changePassword = (currentPass: string, newPass: string): { success: boolean; error?: string } => {
    if (!user) return { success: false, error: 'Avval tizimga kiring' };
    if (newPass.length < 6) return { success: false, error: 'Yangi parol kamida 6 belgidan iborat bo‘lishi kerak' };
    try {
      const accounts = getStoredAccounts();
      const key = user.email.toLowerCase();
      const entry = accounts[key];
      if (entry && entry.pass && entry.pass !== currentPass) {
        return { success: false, error: 'Hozirgi parol notogri' };
      }
      if (entry) {
        entry.pass = newPass;
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(accounts));
      }
    } catch {}
    return { success: true };
  };

  const logout = async () => {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch {}
    }
    setUser(null);
    try {
      localStorage.removeItem('vantegewear_user');
    } catch {}
  };

  // Foydalanuvchi interfeys orqali Supabase URL & Anon Key kiritishi uchun
  const updateSupabaseCredentials = (url: string, anonKey: string): boolean => {
    const ok = setCustomSupabaseConfig(url, anonKey);
    if (ok) {
      setSupabaseConnected(true);
      setCurrentSupabaseUrl(url.trim());
    }
    return ok;
  };

  const resetSupabaseCredentials = () => {
    clearCustomSupabaseConfig();
    const cfg = getSupabaseConfig();
    setSupabaseConnected(isSupabaseValid(cfg));
    setCurrentSupabaseUrl(cfg.url);
  };

  const addOrder = (items: OrderItem[], total: number, address: string): UserOrder => {
    const newOrd: UserOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      items,
      total,
      status: 'processing',
      trackingNumber: `UZ-EXP-${Math.floor(1000000 + Math.random() * 9000000)}`,
      shippingAddress: address || 'Tashkent, Amir Temur ko‘chasi 108',
    };
    setOrders((prev) => {
      const next = [newOrd, ...prev];
      try {
        localStorage.setItem('vantegewear_orders', JSON.stringify(next));
      } catch {}
      return next;
    });
    return newOrd;
  };

  const updateOrderStatus = (orderId: string, status: UserOrder['status']) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === orderId ? { ...o, status } : o));
      try {
        localStorage.setItem('vantegewear_orders', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        orders,
        isAuthModalOpen,
        authModalMode,
        isOrdersModalOpen,
        isSupabaseConnected: supabaseConnected,
        supabaseUrl: currentSupabaseUrl,
        openAuthModal,
        closeAuthModal,
        openOrdersModal,
        closeOrdersModal,
        openSettingsModal,
        closeSettingsModal,
        isSettingsModalOpen,
        login,
        loginWithPhone,
        loginWithGoogle,
        loginWithTelegram,
        register,
        updateProfile,
        changePassword,
        logout,
        updateSupabaseCredentials,
        resetSupabaseCredentials,
        addOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
