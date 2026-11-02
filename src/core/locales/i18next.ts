import i18next  from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './translation_en.json';
import esTranslation from './translation_es.json';

if (!i18next.isInitialized) {
  void i18next.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: enTranslation },
      es: { translation: esTranslation },
    },
    interpolation: { escapeValue: false },
    initImmediate: false,
  });
}

const translateSystem = i18next;
export default translateSystem;
