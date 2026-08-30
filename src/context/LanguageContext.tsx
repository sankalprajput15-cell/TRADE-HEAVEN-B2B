import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, LanguageOption } from '../components/marketplace/LanguageRegionSelector';
import { BASE_TRANSLATIONS } from '../data/translationsData';
import type { Translations } from '../data/translationsData';

export type LanguageCode = 'en' | 'zh' | 'es' | 'ar' | 'de' | 'fr' | 'pt' | 'ru' | 'ja' | 'hi' | 'tr' | 'vi';
export type { Translations };

// Master dictionary of common phrases used across components
const COMMON_PHRASES: Record<string, Partial<Record<LanguageCode, string>>> = {
  'Home': { zh: '首页', es: 'Inicio', ar: 'الرئيسية', de: 'Startseite', fr: 'Accueil', pt: 'Início', ru: 'Главная', ja: 'ホーム', hi: 'होम', tr: 'Ana Sayfa', vi: 'Trang chủ' },
  'About Us': { zh: '关于我们', es: 'Sobre Nosotros', ar: 'معلومات عنا', de: 'Über uns', fr: 'À propos', pt: 'Sobre Nós', ru: 'О нас', ja: '会社概要', hi: 'हमारे बारे में', tr: 'Hakkımızda', vi: 'Về chúng tôi' },
  'Trust & Safety': { zh: '安全信保', es: 'Seguridad', ar: 'الأمان والثقة', de: 'Sicherheit', fr: 'Sécurité', pt: 'Segurança', ru: 'Безопасность', ja: '信頼と安全', hi: 'सुरक्षा और विश्वास', tr: 'Güvenlik', vi: 'An toàn & Tin cậy' },
  'News & Insights': { zh: '行业资讯', es: 'Noticias', ar: 'الأخبار', de: 'Nachrichten', fr: 'Actualités', pt: 'Notícias', ru: 'Новости', ja: 'ニュース', hi: 'समाचार', tr: 'Haberler', vi: 'Tin tức' },
  'Premium Services': { zh: '尊享服务', es: 'Servicios Premium', ar: 'خدمات متميزة', de: 'Premium-Dienste', fr: 'Services Premium', pt: 'Serviços Premium', ru: 'Премиум', ja: 'プレミアム', hi: 'प्रीमियम सेवाएं', tr: 'Premium Hizmetler', vi: 'Dịch vụ cao cấp' },
  'Buyers': { zh: '采购买家', es: 'Compradores', ar: 'المشترون', de: 'Käufer', fr: 'Acheteurs', pt: 'Compradores', ru: 'Покупатели', ja: 'バイヤー', hi: 'खरीदार', tr: 'Alıcılar', vi: 'Người mua' },
  'Suppliers': { zh: '认证供应商', es: 'Proveedores', ar: 'الموردون', de: 'Lieferanten', fr: 'Fournisseurs', pt: 'Fornecedores', ru: 'Поставщики', ja: 'サプライヤー', hi: 'आपूर्तिकर्ता', tr: 'Tedarikçiler', vi: 'Nhà cung cấp' },
  'Menu': { zh: '全站菜单', es: 'Menú', ar: 'القائمة', de: 'Menü', fr: 'Menu', pt: 'Menu', ru: 'Меню', ja: 'メニュー', hi: 'मेन्यू', tr: 'Menü', vi: 'Menu' },
  'Post Buy RFQ': { zh: '发布采购需求', es: 'Publicar RFQ', ar: 'نشر طلب RFQ', de: 'RFQ erstellen', fr: 'Publier RFQ', pt: 'Publicar RFQ', ru: 'Разместить RFQ', ja: '調達案件投稿', hi: 'खरीद मांग दर्ज करें', tr: 'RFQ Oluştur', vi: 'Đăng RFQ' },
  'Sign In': { zh: '登录', es: 'Iniciar Sesión', ar: 'تسجيل الدخول', de: 'Anmelden', fr: 'Connexion', pt: 'Entrar', ru: 'Войти', ja: 'ログイン', hi: 'साइन इन', tr: 'Giriş Yap', vi: 'Đăng nhập' },
  'Register Free': { zh: '免费注册', es: 'Registro Gratis', ar: 'تسجيل مجاني', de: 'Kostenlos registrieren', fr: 'Inscription Gratuite', pt: 'Cadastre-se', ru: 'Регистрация', ja: '無料会員登録', hi: 'मुफ़्त पंजीकरण', tr: 'Ücretsiz Kayıt', vi: 'Đăng ký miễn phí' },
  'Sign Out': { zh: '退出', es: 'Cerrar Sesión', ar: 'خروج', de: 'Abmelden', fr: 'Déconnexion', pt: 'Sair', ru: 'Выйти', ja: 'ログアウト', hi: 'साइन आउट', tr: 'Çıkış', vi: 'Đăng xuất' },
  '100% trade protection & Trade Assurance': { zh: '100% 资金托管与信保体系', es: '100% Protección Comercial', ar: 'حماية وضمان تجاري 100%', de: '100% Handelsschutz', fr: '100% Protection commerciale', pt: '100% Proteção Comercial', ru: '100% Защита сделок', ja: '100% 取引保証・エスクロー', hi: '100% व्यापार सुरक्षा', tr: '%100 Ticaret Güvencesi', vi: '100% Bảo vệ giao dịch' },
  'Verified Direct Factory Products & Volume Wholesale': { zh: '认证源头工厂直供商品与大宗批发', es: 'Productos Directos de Fábrica y Venta Mayorista', ar: 'منتجات المصانع المباشرة والبيع بالجملة المعتمد', de: 'Geprüfte Fabrikdirektprodukte & Großhandel', fr: 'Produits Direct Usine Vérifiés & Vente en Gros', pt: 'Produtos de Fábrica Auditados e Atacado Global', ru: 'Проверенная продукция от заводов и крупный опт', ja: '認証工場直販製品＆ボリュームディスカウント卸売', hi: 'सत्यापित फैक्ट्री डायरेक्ट उत्पाद और बल्क थोक बिक्री', tr: 'Doğrudan Fabrika Ürünleri ve Toptan Satış', vi: 'Sản Phẩm Trực Tiếp Từ Nhà Máy & Bán Buôn Số Lượng Lớn' },
  'Source directly from audited manufacturing plants with live FOB/CIF tier pricing and guaranteed lead times.': { zh: '直接向经过实地验厂的规模化制造工厂采购，支持FOB/CIF梯度批发价与准时交期保障。', es: 'Abastézcase directamente de plantas auditadas con precios escalonados FOB/CIF y tiempos de entrega garantizados.', ar: 'استورد مباشرة من المصانع المعتمدة بأسعار FOB/CIF تدريجية وأوقات تسليم مضمونة.', de: 'Direktbezug aus auditierten Werken mit gestaffelten FOB/CIF-Preisen und garantierten Lieferfristen.', fr: 'Achetez directement auprès d\'usines auditées avec tarifs dégressifs FOB/CIF et délais garantis.', pt: 'Compre diretamente de indústrias certificadas com preços FOB/CIF escalonados e entrega garantida.', ru: 'Закупки напрямую у проверенных производств с градацией цен FOB/CIF и гарантией сроков.', ja: '監査済み工場からFOB/CIF階層価格と厳守される納期で直接調達。', hi: 'सत्यापित कारखानों से स्तरीय FOB/CIF मूल्य और समयबद्ध डिलीवरी के साथ सीधे खरीदें।', tr: 'Kademeli FOB/CIF fiyatları ve garantili teslimat süreleri ile denetlenmiş fabrikalardan tedarik edin.', vi: 'Nhập hàng trực tiếp từ các xưởng sản xuất đã kiểm định với giá FOB/CIF theo bậc và cam kết tiến độ.' },
  'View All Products': { zh: '浏览全部商品', es: 'Ver Todos los Productos', ar: 'عرض كافة المنتجات', de: 'Alle Produkte anzeigen', fr: 'Voir Tous les Produits', pt: 'Ver Todos os Produtos', ru: 'Смотреть все товары', ja: 'すべての製品を見る', hi: 'सभी उत्पाद देखें', tr: 'Tüm Ürünleri Gör', vi: 'Xem tất cả sản phẩm' },
  'Contact Supplier': { zh: '联系供应商', es: 'Contactar Proveedor', ar: 'تواصل مع المصنع', de: 'Lieferant kontaktieren', fr: 'Contacter l\'Usine', pt: 'Falar com Fornecedor', ru: 'Связаться с заводом', ja: '工場に問い合わせる', hi: 'आपूर्तिकर्ता से संपर्क करें', tr: 'Tedarikçiyle İletişime Geç', vi: 'Liên hệ nhà cung cấp' },
  'Request Instant Quote': { zh: '获取即时报价', es: 'Solicitar Cotización Inmediata', ar: 'طلب تسعيرة فورية', de: 'Sofortangebot anfordern', fr: 'Demander un Devis Immédiat', pt: 'Solicitar Cotação Imediata', ru: 'Запросить расчет цены', ja: '即時見積を依頼', hi: 'तत्काल कोटेशन मांगें', tr: 'Anında Teklif İste', vi: 'Nhận báo giá ngay' },
  'Verified Factory': { zh: '认证源头工厂', es: 'Fábrica Verificada', ar: 'مصنع معتمد', de: 'Geprüfter Hersteller', fr: 'Usine Vérifiée', pt: 'Fábrica Verificada', ru: 'Проверенный завод', ja: '認証製造工場', hi: 'सत्यापित कारखाना', tr: 'Onaylı Fabrika', vi: 'Nhà máy xác minh' },
  'Live Leads': { zh: '实时商机', es: 'Demandas en Vivo', ar: 'فرص مباشرة', de: 'Live-Leads', fr: 'Demandes en Direct', pt: 'Oportunidades em Tempo Real', ru: 'Свежие заявки', ja: 'リアルタイム案件', hi: 'लाइव मांगें', tr: 'Canlı Talepler', vi: 'Đơn hàng mới' },
  'All Verified Sectors': { zh: '所有认证产业类别', es: 'Todos los Sectores Verificados', ar: 'كافة القطاعات المعتمدة', de: 'Alle geprüften Branchen', fr: 'Tous les Secteurs Vérifiés', pt: 'Todos os Setores Verificados', ru: 'Все проверенные отрасли', ja: '全認証産業セクター', hi: 'सभी सत्यापित उद्योग', tr: 'Tüm Onaylı Sektörler', vi: 'Tất Cả Ngành Hàng Đã Xác Minh' },
  'Search Products': { zh: '搜索商品', es: 'Buscar Productos', ar: 'بحث عن المنتجات', de: 'Produkte suchen', fr: 'Rechercher Produits', pt: 'Buscar Produtos', ru: 'Поиск товаров', ja: '製品を検索', hi: 'उत्पाद खोजें', tr: 'Ürün Ara', vi: 'Tìm sản phẩm' },
  'Search Live RFQs': { zh: '搜索实时询盘', es: 'Buscar RFQs en Vivo', ar: 'بحث في طلبات الشراء', de: 'Live-RFQs durchsuchen', fr: 'Rechercher RFQs en Direct', pt: 'Buscar RFQs em Tempo Real', ru: 'Поиск по RFQ', ja: '調達案件を検索', hi: 'लाइव RFQs खोजें', tr: 'Canlı RFQ Ara', vi: 'Tìm RFQ trực tiếp' },
  'Search Suppliers': { zh: '搜索供应商', es: 'Buscar Proveedores', ar: 'بحث عن الموردين', de: 'Lieferanten suchen', fr: 'Rechercher Fournisseurs', pt: 'Buscar Fornecedores', ru: 'Поиск поставщиков', ja: 'サプライヤーを検索', hi: 'आपूर्तिकर्ता खोजें', tr: 'Tedarikçi Ara', vi: 'Tìm nhà cung cấp' },
  'Source Products': { zh: '查找货源', es: 'Buscar Productos', ar: 'شراء المنتجات', de: 'Produkte beschaffen', fr: 'Acheter des Produits', pt: 'Comprar Produtos', ru: 'Закупка товаров', ja: '商品を調达', hi: 'उत्पाद सोर्स करें', tr: 'Ürün Tedarik Et', vi: 'Tìm nguồn hàng' }
};

export interface LanguageContextType {
  currentLanguage: LanguageOption;
  languageCode: LanguageCode;
  setLanguage: (code: string) => void;
  t: (key: keyof Translations, fallback?: string) => string;
  tr: (dict: Partial<Record<LanguageCode | string, string>>) => string;
  tText: (englishText: string) => string;
  translations: Translations;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [langCode, setLangCode] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang && SUPPORTED_LANGUAGES.some(l => l.code === urlLang.toLowerCase())) {
        return urlLang.toLowerCase() as LanguageCode;
      }
      const stored = localStorage.getItem('tradeheaven_language');
      if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored.toLowerCase())) {
        return stored.toLowerCase() as LanguageCode;
      }
    }
    return 'en';
  });

  const handleSetLanguage = (code: string) => {
    const normalized = (code || 'en').toLowerCase() as LanguageCode;
    const found = SUPPORTED_LANGUAGES.find(l => l.code === normalized);
    const validCode = found ? (found.code as LanguageCode) : 'en';
    
    if (validCode === langCode) return;
    
    try {
      localStorage.setItem('tradeheaven_language', validCode);
      if (found) {
        localStorage.setItem('tradeheaven_region', found.region);
      }
      
      let gtCode = validCode as string;
      if (gtCode === 'zh') gtCode = 'zh-CN';
      
      if (validCode === 'en') {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
      } else {
        document.cookie = 'googtrans=/en/' + gtCode + '; path=/';
        document.cookie = 'googtrans=/en/' + gtCode + '; path=/; domain=' + window.location.hostname;
      }
      
      // Reload the page to ensure Google Translate initializes with the new language
      // and doesn't conflict with React's DOM rendering cycle.
      window.location.reload();
    } catch {}
  };

  // Listen for global custom event across app
  useEffect(() => {
    const handleCustomChange = (e: Event) => {
      const custom = e as CustomEvent<{ language: string }>;
      if (custom?.detail?.language && custom.detail.language !== langCode) {
        const found = SUPPORTED_LANGUAGES.find(l => l.code === custom.detail.language.toLowerCase());
        if (found) {
          setLangCode(found.code as LanguageCode);
        }
      }
    };

    window.addEventListener('tradeheaven_language_change', handleCustomChange);
    return () => window.removeEventListener('tradeheaven_language_change', handleCustomChange);
  }, [langCode]);

  // Sync with document element on mount and change
  useEffect(() => {
    const found = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    const isRTL = found?.dir === 'rtl';
    
    document.documentElement.lang = langCode;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

    if (isRTL) {
      document.body.classList.add('text-right');
      document.body.classList.remove('text-left');
    } else {
      document.body.classList.remove('text-right');
    }

    // Ensure cookie matches current language so Google Translate stays in sync on navigation
    let gtCode = langCode as string;
    if (gtCode === 'zh') gtCode = 'zh-CN';
    
    if (langCode === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
    } else {
      document.cookie = 'googtrans=/en/' + gtCode + '; path=/';
      document.cookie = 'googtrans=/en/' + gtCode + '; path=/; domain=' + window.location.hostname;
    }
    
  }, [langCode]);

  const currentOption = SUPPORTED_LANGUAGES.find(l => l.code === langCode) || SUPPORTED_LANGUAGES[0];
  const activeTranslations = BASE_TRANSLATIONS[langCode] || BASE_TRANSLATIONS.en;

  const t = (key: keyof Translations, fallback?: string): string => {
    return activeTranslations[key] || BASE_TRANSLATIONS.en[key] || fallback || '';
  };

  const tr = (dict: Partial<Record<LanguageCode | string, string>>): string => {
    return dict[langCode] || dict.en || dict.default || Object.values(dict)[0] || '';
  };

  const tText = (englishText: string): string => {
    if (!englishText) return '';
    if (langCode === 'en') return englishText;

    // Check common phrases map
    const mapped = COMMON_PHRASES[englishText];
    if (mapped && mapped[langCode]) {
      return mapped[langCode]!;
    }

    // Check direct key in translations
    const directKey = Object.keys(BASE_TRANSLATIONS.en).find(
      k => BASE_TRANSLATIONS.en[k as keyof Translations] === englishText
    ) as keyof Translations | undefined;

    if (directKey && activeTranslations[directKey]) {
      return activeTranslations[directKey];
    }

    return englishText;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage: currentOption,
        languageCode: langCode,
        setLanguage: handleSetLanguage,
        t,
        tr,
        tText,
        translations: activeTranslations,
        isRTL: currentOption.dir === 'rtl'
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      currentLanguage: SUPPORTED_LANGUAGES[0],
      languageCode: 'en',
      setLanguage: () => {},
      t: (key: keyof Translations, fallback?: string) => BASE_TRANSLATIONS.en[key] || fallback || '',
      tr: (dict: Partial<Record<LanguageCode | string, string>>) => dict.en || Object.values(dict)[0] || '',
      tText: (text: string) => text,
      translations: BASE_TRANSLATIONS.en,
      isRTL: false
    };
  }
  return context;
};
