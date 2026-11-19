import React, { createContext, useContext, useState, useEffect } from "react";

const translations = {
  en: {
    nav: { home: "Home", products: "Products", about: "About", contact: "Contact" },
    hero: {
      eyebrow: "Authentic Iranian Imports | Mirpur AJK's Trusted Distributor",
      headline: "Premium Imported Iranian Products Now Available in Mirpur, AJK",
      subheadline: "Your Wholesale Partner for Authentic Iranian Chocolates, Confectionery & Premium Snacks — Serving Retailers & Bulk Buyers Across Azad Kashmir",
      cta_primary: "Explore Product Catalog",
      cta_secondary: "Order on WhatsApp",
      badge1: "100+ Retailers Trust Us",
      badge2: "Authentic Imports Guaranteed",
    },
    social: {
      products: "Products Monthly",
      retailers: "Retailer Partners",
      years: "Years Serving AJK",
      authentic: "Authentic Products",
      pricing: "Competitive Pricing",
      delivery: "Fast Local Delivery",
      rating: "Trusted by Mirpur's Leading Retailers",
    },
    about: {
      heading: "Mirpur's #1 Choice for Authentic Iranian Imports",
      f1: { title: "Authenticity Guarantee", text: "We source directly from verified Iranian manufacturers, ensuring 100% authentic products with proper import documentation and traceability." },
      f2: { title: "Wholesale Excellence", text: "Competitive bulk pricing tailored for retailers, with flexible minimum order quantities and consistent, reliable stock availability year-round." },
      f3: { title: "Local Advantage", text: "Based in Mirpur with an optimized local supply chain — faster deliveries, lower shipping costs, and a dedicated customer support team." },
      story_heading: "Connecting Mirpur to Iran's Finest Products",
      story_text: "AZ Distribution is Mirpur's premier wholesale distributor of authentic imported Iranian products. From premium chocolates and traditional confectionery to refreshing beverages and famous lava shak sheets, we deliver Iran's finest directly to your shelves. Our rigorous sourcing process ensures every product meets the highest quality standards that your customers expect.",
    },
    products: {
      eyebrow: "Our Product Range",
      heading: "Authentic Iranian Products Catalog",
    },
    why: {
      heading: "Why Retailers Choose AZ Distribution",
      f1: { title: "Authentic Imports", desc: "Certified Iranian products with proper import documentation — every item verified for authenticity" },
      f2: { title: "Competitive Wholesale Pricing", desc: "Best bulk order rates in Mirpur AJK — maximize your retail margins with our wholesale pricing" },
      f3: { title: "Fast Local Delivery", desc: "Same-day and next-day delivery within Mirpur city and surrounding areas of Azad Kashmir" },
      f4: { title: "Trusted by 100+ Retailers", desc: "Supplying top supermarkets, stores and businesses across Mirpur with consistent quality" },
      f5: { title: "Consistent Stock Availability", desc: "Regular imports ensure your favorite Iranian products are always available when you need them" },
      f6: { title: "Responsive Support", desc: "WhatsApp & phone support for urgent orders, 7 days a week — your business never stops, nor do we" },
    },
    testimonials: { heading: "What Our Retail Partners Say" },
    cta: {
      heading: "Ready to Partner with Mirpur's Leading Wholesale Distributor?",
      subtext: "Join 100+ retailers who trust AZ Distribution for consistent quality and competitive pricing. Stock your shelves with authentic Iranian products today.",
      primary_btn: "Start Wholesale Order",
      secondary_btn: "Download Catalog",
    },
    service: {
      heading: "Serving Mirpur AJK & Surrounding Regions",
      cta: "Delivery available within 24–48 hours. Contact us for custom delivery locations across AJK.",
    },
    contact: {
      heading: "Get In Touch With Us",
      success: "Thank you! We will contact you within 24 hours.",
      error: "Something went wrong. Please try WhatsApp or call us directly.",
    },
    footer: {
      tagline: "Authentic Iranian Imports for Mirpur AJK — Premier Wholesale Distributor",
    },
  },
  ur: {
    nav: { home: "ہوم", products: "پروڈکٹس", about: "ہمارے بارے میں", contact: "رابطہ" },
    hero: {
      eyebrow: "مستند ایرانی درآمدات | میرپور آزاد کشمیر کا قابل اعتماد تقسیم کار",
      headline: "ایرانی درآمدی مصنوعات اب میرپور، آزاد کشمیر میں دستیاب ہیں",
      subheadline: "مستند ایرانی چاکلیٹ، مٹھائیوں اور پریمیم اسنیکس کے لیے آپ کا تھوک پارٹنر",
      cta_primary: "پروڈکٹ کیٹلاگ دیکھیں",
      cta_secondary: "واٹس ایپ پر آرڈر کریں",
      badge1: "100+ ریٹیلرز کا اعتماد",
      badge2: "مستند درآمدات کی ضمانت",
    },
    social: {
      products: "ماہانہ مصنوعات",
      retailers: "ریٹیلر پارٹنرز",
      years: "سال کا تجربہ",
      authentic: "مستند مصنوعات",
      pricing: "مسابقتی قیمتیں",
      delivery: "تیز مقامی ترسیل",
      rating: "میرپور کے معروف ریٹیلرز کا اعتماد",
    },
    about: {
      heading: "ایرانی درآمدات کے لیے میرپور کا پہلا انتخاب",
      f1: { title: "اصالت کی ضمانت", text: "ہم براہ راست تصدیق شدہ ایرانی مینوفیکچررز سے سورس کرتے ہیں — ہر مصنوع کی اصالت کی مکمل ضمانت۔" },
      f2: { title: "تھوک فروخت کی عمدگی", text: "ریٹیلرز کے لیے مسابقتی بلک قیمتیں، لچکدار آرڈر مقدار اور مستقل اسٹاک دستیابی۔" },
      f3: { title: "مقامی فائدہ", text: "میرپور میں واقع — تیز ترسیل، کم شپنگ اخراجات اور ذمہ دار کسٹمر سپورٹ۔" },
      story_heading: "میرپور کو ایران کی بہترین مصنوعات سے جوڑنا",
      story_text: "AZ Distribution میرپور کا سب سے معروف تھوک تقسیم کار ہے جو مستند ایرانی مصنوعات فراہم کرتا ہے۔ پریمیم چاکلیٹ سے لے کر روایتی مٹھائیوں اور لاوا شاک شیٹس تک — ایران کا بہترین آپ کی دکان تک۔",
    },
    products: {
      eyebrow: "ہماری مصنوعات کی رینج",
      heading: "مستند ایرانی مصنوعات کیٹلاگ",
    },
    why: {
      heading: "ریٹیلرز AZ Distribution کیوں چنتے ہیں",
      f1: { title: "مستند درآمدات", desc: "مناسب دستاویزات کے ساتھ تصدیق شدہ ایرانی مصنوعات — ہر آئٹم تصدیق شدہ" },
      f2: { title: "مسابقتی تھوک قیمتیں", desc: "میرپور آزاد کشمیر میں بلک آرڈرز کے لیے بہترین نرخ" },
      f3: { title: "تیز مقامی ترسیل", desc: "میرپور اور آس پاس کے علاقوں میں اسی دن اور اگلے دن کی ترسیل" },
      f4: { title: "100+ ریٹیلرز کا اعتماد", desc: "میرپور کے معروف سپرمارکیٹوں اور دکانوں کو مستقل سپلائی" },
      f5: { title: "مستقل اسٹاک دستیابی", desc: "باقاعدہ درآمدات سے آپ کی پسندیدہ ایرانی مصنوعات ہمیشہ دستیاب" },
      f6: { title: "ذمہ دار سپورٹ", desc: "فوری آرڈرز کے لیے ہفتے کے 7 دن واٹس ایپ اور فون سپورٹ" },
    },
    testimonials: { heading: "ہمارے ریٹیل پارٹنرز کیا کہتے ہیں" },
    cta: {
      heading: "میرپور کے معروف تھوک تقسیم کار کے ساتھ پارٹنرشپ کے لیے تیار ہیں؟",
      subtext: "ان 100+ ریٹیلرز میں شامل ہوں جو AZ Distribution پر اعتماد کرتے ہیں۔ آج ہی اپنی دکان کو مستند ایرانی مصنوعات سے بھریں۔",
      primary_btn: "تھوک آرڈر شروع کریں",
      secondary_btn: "کیٹلاگ ڈاؤنلوڈ کریں",
    },
    service: {
      heading: "میرپور آزاد کشمیر اور آس پاس کے علاقوں میں خدمات",
      cta: "24-48 گھنٹوں میں ترسیل دستیاب۔ کسٹم ترسیل مقامات کے لیے رابطہ کریں۔",
    },
    contact: {
      heading: "ہم سے رابطہ کریں",
      success: "شکریہ! ہم 24 گھنٹوں میں آپ سے رابطہ کریں گے۔",
      error: "کچھ غلط ہو گیا۔ براہ کرم واٹس ایپ یا فون پر رابطہ کریں۔",
    },
    footer: {
      tagline: "میرپور آزاد کشمیر کے لیے مستند ایرانی درآمدات — پریمیم تھوک تقسیم کار",
    },
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("az-lang") || "en");

  useEffect(() => {
    localStorage.setItem("az-lang", lang);
    document.documentElement.setAttribute("dir", lang === "ur" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang === "ur" ? "ur" : "en");
  }, [lang]);

  const toggleLang = () => setLang((prev) => (prev === "en" ? "ur" : "en"));

  const t = (key) => {
    const keys = key.split(".");
    let value = translations[lang];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
