import i18next  from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './translation_en.json';
import esTranslation from './translation_es.json';
import hiTranslation from './translation_hi.json';
import frTranslation from './translation_fr.json';
import ptBRTranslation from './translation_pt-BR.json';
import zhCNTranslation from './translation_zh-CN.json';

if (!i18next.isInitialized) {
  void i18next.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: enTranslation },
      es: { translation: esTranslation },
      hi: { translation: hiTranslation },
      fr: { translation: frTranslation },
      "pt-BR": { translation: ptBRTranslation },
      "zh-CN": { translation: zhCNTranslation },
    },
    interpolation: { escapeValue: false },
    initImmediate: false,
  });
}

const translateSystem = i18next;
export default translateSystem;
