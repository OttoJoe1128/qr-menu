import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import trTranslation from './locales/tr.json';
import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';
import arTranslation from './locales/ar.json';

const resources = {
  tr: { translation: trTranslation },
  en: { translation: enTranslation },
  es: { translation: esTranslation },
  ar: { translation: arTranslation }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr', // Varsayılan başlangıç dili Türkçe
    fallbackLng: 'tr', // Güvenlik Ağı: Çeviri bulunamazsa TR göster
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;