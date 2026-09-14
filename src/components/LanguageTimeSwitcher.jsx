import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageTimeSwitcher = () => {
  const { i18n } = useTranslation();
  const [time, setTime] = useState(new Date());
  // Tarayıcının varsayılan saat dilimini başlangıç değeri yapıyoruz
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Arapça için Sağdan Sola (RTL) Kontrolü
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Canlı Saat Sayacı (Her saniye güncellenir)
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  // Harici kütüphane kullanmadan performanslı saat formatlama
  const formattedTime = new Intl.DateTimeFormat(i18n.language, {
    timeStyle: 'short',
    timeZone: timezone
  }).format(time);

  return (
    <div className="flex items-center gap-3 text-sm font-medium z-50">
      {/* Saat Dilimi Seçici */}
      <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/30 shadow-sm transition-all hover:bg-white/30">
        <span>🕒</span>
        <span className="w-12 text-center text-gray-800 dark:text-white" suppressHydrationWarning>{formattedTime}</span>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="bg-transparent outline-none cursor-pointer appearance-none text-center font-bold text-gray-800 dark:text-white"
        >
          <option value="Europe/Istanbul" className="text-black">IST</option>
          <option value="America/New_York" className="text-black">NY</option>
          <option value="Europe/London" className="text-black">LON</option>
          <option value="Asia/Dubai" className="text-black">DXB</option>
          <option value="Asia/Tokyo" className="text-black">TYO</option>
        </select>
      </div>

      {/* Dil Seçici */}
      <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/30 shadow-sm transition-all hover:bg-white/30">
        <span>🌐</span>
        <select
          value={i18n.language}
          onChange={handleLanguageChange}
          className="bg-transparent outline-none cursor-pointer appearance-none font-bold uppercase text-gray-800 dark:text-white"
        >
          <option value="en" className="text-black">EN</option>
          <option value="es" className="text-black">ES</option>
          <option value="ar" className="text-black">AR</option>
        </select>
      </div>
    </div>
  );
};

export default LanguageTimeSwitcher;
