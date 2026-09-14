import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageTimeSwitcher = () => {
  const { i18n } = useTranslation();
  const [time, setTime] = useState(new Date());
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [openDropdown, setOpenDropdown] = useState(null); // 'time', 'lang' veya null
  const containerRef = useRef(null);

  // Arapça (RTL) Kontrolü
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Canlı Saat
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Menü dışına tıklandığında dropdown'ı kapatma
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedTime = new Intl.DateTimeFormat(i18n.language, {
    timeStyle: 'short',
    timeZone: timezone
  }).format(time);

  const timezones = [
    { id: 'Europe/Istanbul', label: 'IST - İstanbul' },
    { id: 'America/New_York', label: 'NY - New York' },
    { id: 'Europe/London', label: 'LON - Londra' },
    { id: 'Asia/Dubai', label: 'DXB - Dubai' },
    { id: 'Asia/Tokyo', label: 'TYO - Tokyo' }
  ];

  const languages = [
    { id: 'tr', label: '🇹🇷 TR - Türkçe' },
    { id: 'en', label: '🇬🇧 EN - English' },
    { id: 'es', label: '🇪🇸 ES - Español' },
    { id: 'ar', label: '🇦🇪 AR - العربية' }
  ];

  return (
    <div ref={containerRef} className="flex items-center gap-3 text-sm font-medium z-50">
      {/* Özel Saat Dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(openDropdown === 'time' ? null : 'time')}
          className="flex items-center gap-2 bg-slate-900/80 sm:bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-slate-700 sm:border-white/20 shadow-lg transition-all hover:bg-slate-800 sm:hover:bg-white/20 text-white active:scale-95"
        >
          <span>🕒</span>
          <span className="w-12 text-center font-bold tracking-wider" suppressHydrationWarning>{formattedTime}</span>
        </button>
        
        {openDropdown === 'time' && (
          <div className="absolute top-full mt-3 right-0 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 overflow-hidden animate-[slideUp_0.2s_ease-out]">
            {timezones.map(tz => (
              <button
                key={tz.id}
                onClick={() => { setTimezone(tz.id); setOpenDropdown(null); }}
                className={`text-left px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${timezone === tz.id ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                {tz.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Özel Dil Dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(openDropdown === 'lang' ? null : 'lang')}
          className="flex items-center gap-2 bg-slate-900/80 sm:bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-slate-700 sm:border-white/20 shadow-lg transition-all hover:bg-slate-800 sm:hover:bg-white/20 text-white active:scale-95"
        >
          <span>🌐</span>
          <span className="font-black uppercase tracking-widest">{i18n.language}</span>
        </button>
        
        {openDropdown === 'lang' && (
          <div className="absolute top-full mt-3 right-0 w-40 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 overflow-hidden animate-[slideUp_0.2s_ease-out]">
            {languages.map(lang => (
              <button
                key={lang.id}
                onClick={() => { i18n.changeLanguage(lang.id); setOpenDropdown(null); }}
                className={`text-left px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${i18n.language === lang.id ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageTimeSwitcher;
