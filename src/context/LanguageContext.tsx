'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'uz' | 'en' | 'ru';

export interface Translations {
  // Navigation & Branding
  brandTag: string;
  navRunway: string;
  navFitting: string;
  navCatalog: string;
  navLookbook: string;
  navNetwork: string;
  navStores: string;
  navJournal: string;
  navAbout: string;
  navAdmin: string;
  navFaq: string;
  navContact: string;
  dressModel: string;
  openBag: string;

  // Auth & Profile
  signIn: string;
  signUp: string;
  signOut: string;
  myAccount: string;
  myOrders: string;
  adminDashboard: string;
  welcomeBack: string;
  createAccount: string;
  demoAdminLogin: string;
  demoUserLogin: string;
  emailLabel: string;
  passwordLabel: string;
  nameLabel: string;
  cityLabel: string;
  sizePreference: string;
  rememberMe: string;
  forgotPassword: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  roleAdmin: string;
  roleMember: string;

  // Common UI
  addToBag: string;
  removeFromBag: string;
  addedToBag: string;
  viewDetails: string;
  close: string;
  searchPlaceholder: string;
  all: string;
  outerwear: string;
  trousers: string;
  accessories: string;
  inStock: string;
  preOrder: string;
  limitedEdition: string;
  pieces: string;
  total: string;
  checkout: string;
  orderNow: string;
  filterBy: string;
  sortBy: string;
  priceAsc: string;
  priceDesc: string;
  newest: string;
  currency: string;

  // Startup Info & Hero
  heroTagline: string;
  heroSub: string;
  exploreArchive: string;
  startupStoryTitle: string;
  startupStorySub: string;
  seedFunding: string;
  activeWearers: string;
  globalHubs: string;
  patentsPending: string;
  learnMoreAboutUs: string;

  // Sections
  fittingTitle: string;
  fittingSub: string;
  networkTitle: string;
  networkSub: string;
  storesTitle: string;
  storesSub: string;
  journalTitle: string;
  journalSub: string;
  bookPrivateFitting: string;
  readArticle: string;
  
  // Toast messages
  toastLanguageChanged: string;
  toastLoggedOut: string;
  toastLoggedIn: string;
  toastRegistered: string;
  toastOrderPlaced: string;
}

export const DICTIONARY: Record<Language, Translations> = {
  uz: {
    brandTag: 'SHELL ARXIVI · 2026',
    navRunway: 'Runway',
    navFitting: 'Fitting Room',
    navCatalog: 'Katalog',
    navLookbook: 'Lookbook',
    navNetwork: 'Tarmoq',
    navStores: 'Do‘konlar',
    navJournal: 'Journal',
    navAbout: 'Startup haqida',
    navAdmin: 'Admin Panel',
    navFaq: 'Savol-Javob',
    navContact: 'Aloqa',
    dressModel: 'MODELNI KIYDIRISH',
    openBag: 'Xarid savati',

    signIn: 'Kirish',
    signUp: 'Ro‘yxatdan o‘tish',
    signOut: 'Chiqish',
    myAccount: 'Mening profilim',
    myOrders: 'Buyurtmalarim',
    adminDashboard: 'Boshqaruv paneli',
    welcomeBack: 'Qaytib kelganingizdan xursandmiz',
    createAccount: 'Yangi VANTEGE ID ochish',
    demoAdminLogin: '⚡ Demo Admin bilan kirish',
    demoUserLogin: '👤 Demo Mijoz bilan kirish',
    emailLabel: 'Elektron pochta',
    passwordLabel: 'Parol',
    nameLabel: 'Ism va Familiya',
    cityLabel: 'Shahar',
    sizePreference: 'Afzal ko‘rgan o‘lchamingiz',
    rememberMe: 'Eslab qolish',
    forgotPassword: 'Parolni unutdingizmi?',
    alreadyHaveAccount: 'Profilingiz bormi? Kirish',
    dontHaveAccount: 'Akkountingiz yo‘qmi? Ro‘yxatdan o‘tish',
    roleAdmin: 'TIZIM ADMINISTRATORI',
    roleMember: 'VIP A’ZO · TIER 1',

    addToBag: 'Savatga qo‘shish',
    removeFromBag: 'Savatdan chiqarish',
    addedToBag: 'Savatga qo‘shildi',
    viewDetails: 'Batafsil ko‘rish',
    close: 'Yopish',
    searchPlaceholder: 'Mahsulot yoki mato nomini qidiring...',
    all: 'Barchasi',
    outerwear: 'Ustki kiyim',
    trousers: 'Shimlar',
    accessories: 'Aksessuarlar',
    inStock: 'Mavjud',
    preOrder: 'Oldindan buyurtma',
    limitedEdition: 'Cheklangan son',
    pieces: 'dona',
    total: 'Jami',
    checkout: 'Buyurtmani rasmiylashtirish',
    orderNow: 'Hozir xarid qilish',
    filterBy: 'Filtrlash',
    sortBy: 'Saralash',
    priceAsc: 'Narx: arzondan qimmatga',
    priceDesc: 'Narx: qimmatdan arzonga',
    newest: 'Eng yangilari',
    currency: '$',

    heroTagline: 'Tungi shahar uchun nano-muhandislik kiyimlari',
    heroSub: 'VANTEGE WEAR — 3 qatlamli grafen membranasi, ultratovushli tikuvlar va sun’iy intellekt virtual fitting tajribasi.',
    exploreArchive: 'Arxivni ko‘rish',
    startupStoryTitle: 'VANTEGE WEAR — Kelajak kiyimlari startapi',
    startupStorySub: 'Moda va chuqur texnologiyalar tutashuvida yaratilgan texnik tashqi kiyim brendi.',
    seedFunding: '$4.8M Seed sarmoya jalb qilindi',
    activeWearers: '48,200+ faol kiyim egalari',
    globalHubs: '6 ta shahar flagman laboratoriyalari',
    patentsPending: '14 ta xalqaro nanotexnologiya patenti',
    learnMoreAboutUs: 'Startap haqida to‘liq o‘qish',

    fittingTitle: 'Virtual Fitting Room v2.6',
    fittingSub: 'Modelni tanlang yoki shaxsiy fotosuratingizni yuklab, kiyimlarni real vaqtda sinab ko‘ring.',
    networkTitle: 'Global Do‘konlar va Telemetriya Tarmog‘i',
    networkSub: 'Haqiqiy vaqt rejimida do‘konlar zaxirasi, ob-havo sensorlari va inventar integratsiyasi.',
    storesTitle: 'Bizning Flagman Do‘konlarimiz',
    storesSub: 'Toshkent, Samarqand, Olmaota, Bishkek va Dubaydagi xususiy sinov studiyalari.',
    journalTitle: 'VANTEGE Journal & Material Science',
    journalSub: 'Mato fizikasi, ultratovushli muhrlash va tungi arxitektura bo‘yicha maqolalar.',
    bookPrivateFitting: 'VIP Xususiy Sinovni Band Qilish',
    readArticle: 'Maqolani o‘qish',

    toastLanguageChanged: 'Til O‘zbekchaga o‘zgartirildi',
    toastLoggedOut: 'Tizimdan muvaffaqiyatli chiqildi',
    toastLoggedIn: 'Xush kelibsiz! Tizimga muvaffaqiyatli kirdingiz',
    toastRegistered: 'VANTEGE ID yaratildi! Xush kelibsiz',
    toastOrderPlaced: 'Buyurtma qabul qilindi! Concierge siz bilan bog‘lanadi',
  },
  en: {
    brandTag: 'SHELL ARCHIVE · 2026',
    navRunway: 'Runway',
    navFitting: 'Fitting Room',
    navCatalog: 'Catalog',
    navLookbook: 'Lookbook',
    navNetwork: 'Network',
    navStores: 'Stores',
    navJournal: 'Journal',
    navAbout: 'About Startup',
    navAdmin: 'Admin Panel',
    navFaq: 'FAQ',
    navContact: 'Contact',
    dressModel: 'DRESS MODEL',
    openBag: 'Shopping Bag',

    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    myAccount: 'My Account',
    myOrders: 'My Orders',
    adminDashboard: 'Admin Dashboard',
    welcomeBack: 'Welcome Back',
    createAccount: 'Create VANTEGE ID',
    demoAdminLogin: '⚡ One-Click Demo Admin',
    demoUserLogin: '👤 One-Click Demo Customer',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    nameLabel: 'Full Name',
    cityLabel: 'City',
    sizePreference: 'Preferred Size',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    alreadyHaveAccount: 'Already have an account? Sign in',
    dontHaveAccount: 'Don’t have an account? Sign up',
    roleAdmin: 'SYSTEM ADMINISTRATOR',
    roleMember: 'VIP MEMBER · TIER 1',

    addToBag: 'Add to Bag',
    removeFromBag: 'Remove from Bag',
    addedToBag: 'Added to bag',
    viewDetails: 'View Details',
    close: 'Close',
    searchPlaceholder: 'Search garments, technical fabrics...',
    all: 'All',
    outerwear: 'Outerwear',
    trousers: 'Trousers',
    accessories: 'Accessories',
    inStock: 'In Stock',
    preOrder: 'Pre-Order',
    limitedEdition: 'Limited Edition',
    pieces: 'pcs',
    total: 'Total',
    checkout: 'Proceed to Checkout',
    orderNow: 'Order Now',
    filterBy: 'Filter By',
    sortBy: 'Sort By',
    priceAsc: 'Price: Low to High',
    priceDesc: 'Price: High to Low',
    newest: 'Newest Releases',
    currency: '$',

    heroTagline: 'Engineered Outerwear for the Midnight Generation',
    heroSub: 'VANTEGE WEAR combines 3-layer graphene membranes, ultrasonic seam fusion, and computer-vision virtual fitting.',
    exploreArchive: 'Explore Archive',
    startupStoryTitle: 'VANTEGE WEAR — Next-Gen Outerwear Startup',
    startupStorySub: 'Born at the intersection of extreme continental climates and deep material science.',
    seedFunding: '$4.8M Seed Round Raised',
    activeWearers: '48,200+ Active Shell Wearers',
    globalHubs: '6 Urban Flagship Studios',
    patentsPending: '14 Nanotech Patents Pending',
    learnMoreAboutUs: 'Read Full Startup Story',

    fittingTitle: 'Virtual Fitting Room v2.6',
    fittingSub: 'Select a silhouette or upload your photo to preview high-precision garment draping.',
    networkTitle: 'Global Telemetry & Store IoT Network',
    networkSub: 'Real-time store inventory, weather sensor calibration, and supply chain telemetry.',
    storesTitle: 'Our Flagship Laboratories',
    storesSub: 'Private try-on studios across Tashkent, Samarkand, Almaty, Bishkek, and Dubai.',
    journalTitle: 'VANTEGE Journal & Material Science',
    journalSub: 'Field notes, aerodynamic textile research, and technical design essays.',
    bookPrivateFitting: 'Book VIP Fitting Session',
    readArticle: 'Read Story',

    toastLanguageChanged: 'Language switched to English',
    toastLoggedOut: 'Logged out successfully',
    toastLoggedIn: 'Welcome back! You are logged in',
    toastRegistered: 'VANTEGE ID created! Welcome aboard',
    toastOrderPlaced: 'Order placed! Concierge will reach out shortly',
  },
  ru: {
    brandTag: 'SHELL АРХИВ · 2026',
    navRunway: 'Подиум',
    navFitting: 'Примерочная',
    navCatalog: 'Каталог',
    navLookbook: 'Лукбук',
    navNetwork: 'Сеть',
    navStores: 'Магазины',
    navJournal: 'Журнал',
    navAbout: 'О стартапе',
    navAdmin: 'Панель админа',
    navFaq: 'Вопросы и ответы',
    navContact: 'Контакты',
    dressModel: 'ОДЕТЬ МОДЕЛЬ',
    openBag: 'Корзина',

    signIn: 'Войти',
    signUp: 'Регистрация',
    signOut: 'Выйти',
    myAccount: 'Мой профиль',
    myOrders: 'Мои заказы',
    adminDashboard: 'Панель управления',
    welcomeBack: 'С возвращением',
    createAccount: 'Создать VANTEGE ID',
    demoAdminLogin: '⚡ Войти как Демо-Админ',
    demoUserLogin: '👤 Войти как Демо-Клиент',
    emailLabel: 'Электронная почта',
    passwordLabel: 'Пароль',
    nameLabel: 'Имя и Фамилия',
    cityLabel: 'Город',
    sizePreference: 'Предпочитаемый размер',
    rememberMe: 'Запомнить меня',
    forgotPassword: 'Забыли пароль?',
    alreadyHaveAccount: 'Уже есть аккаунт? Войти',
    dontHaveAccount: 'Нет аккаунта? Зарегистрироваться',
    roleAdmin: 'СИСТЕМНЫЙ АДМИНИСТРАТОР',
    roleMember: 'VIP КЛИЕНТ · УРОВЕНЬ 1',

    addToBag: 'Добавить в корзину',
    removeFromBag: 'Удалить из корзины',
    addedToBag: 'Добавлено в корзину',
    viewDetails: 'Подробнее',
    close: 'Закрыть',
    searchPlaceholder: 'Поиск моделей, мембран, тканей...',
    all: 'Все',
    outerwear: 'Верхняя одежда',
    trousers: 'Брюки',
    accessories: 'Аксессуары',
    inStock: 'В наличии',
    preOrder: 'Предзаказ',
    limitedEdition: 'Лимитировано',
    pieces: 'шт',
    total: 'Итого',
    checkout: 'Оформить заказ',
    orderNow: 'Купить сейчас',
    filterBy: 'Фильтр',
    sortBy: 'Сортировка',
    priceAsc: 'Сначала дешевые',
    priceDesc: 'Сначала дорогие',
    newest: 'Сначала новые',
    currency: '$',

    heroTagline: 'Высокотехнологичная одежда для ночного мегаполиса',
    heroSub: 'VANTEGE WEAR объединяет 3-слойную графеновую мембрану, ультразвуковую сварку швов и 3D-примерочную на базе ИИ.',
    exploreArchive: 'Исследовать архив',
    startupStoryTitle: 'VANTEGE WEAR — Стартап будущего аутдора',
    startupStorySub: 'Рожден на стыке экстремального континентального климата и передового материаловедения.',
    seedFunding: '$4.8M Seed-инвестиций привлечено',
    activeWearers: '48,200+ владельцев изделий',
    globalHubs: '6 флагманских студий',
    patentsPending: '14 международных патентов',
    learnMoreAboutUs: 'Читать историю стартапа',

    fittingTitle: 'Виртуальная примерочная v2.6',
    fittingSub: 'Выберите силуэт или загрузите фото для сверхточной 3D-примерки на базе нейросетей.',
    networkTitle: 'Глобальная телеметрия и сеть бутиков',
    networkSub: 'Остатки в реальном времени, метеодатчики и синхронизация складов.',
    storesTitle: 'Наши флагманские студии',
    storesSub: 'Ташкент, Самарканд, Алматы, Бишкек и Дубай — закрытые персональные примерки.',
    journalTitle: 'VANTEGE Journal & Материаловедение',
    journalSub: 'Исследования аэродинамических тканей, водостойкости и урбан-эстетики.',
    bookPrivateFitting: 'Забронировать VIP примерку',
    readArticle: 'Читать статью',

    toastLanguageChanged: 'Язык изменен на Русский',
    toastLoggedOut: 'Вы успешно вышли из системы',
    toastLoggedIn: 'Добро пожаловать! Вход выполнен',
    toastRegistered: 'VANTEGE ID создан! Добро пожаловать',
    toastOrderPlaced: 'Заказ принят! Консьерж свяжется с вами',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'uz',
  setLanguage: () => undefined,
  t: DICTIONARY.uz,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('uz');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vantegewear_lang') as Language;
      if (saved && (saved === 'uz' || saved === 'en' || saved === 'ru')) {
        setLanguageState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('vantegewear_lang', lang);
    } catch {
      // ignore
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: DICTIONARY[language] || DICTIONARY.uz,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
