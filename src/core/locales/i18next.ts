import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./translation_en.json";
import esTranslation from "./translation_es.json";
import hiTranslation from "./translation_hi.json";
import frTranslation from "./translation_fr.json";
import ptBRTranslation from "./translation_pt-BR.json";
import zhCNTranslation from "./translation_zh-CN.json";

const resources = {
  en: { translation: enTranslation },
  es: { translation: esTranslation },
  hi: { translation: hiTranslation },
  fr: { translation: frTranslation },
  "pt-BR": { translation: ptBRTranslation },
  "zh-CN": { translation: zhCNTranslation },
};

if (!i18next.isInitialized) {
  void i18next.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources,
    interpolation: { escapeValue: false },
    initImmediate: false,
  });
} else if (process.env.NODE_ENV === "development") {
  // Fast Refresh can reload the catalogs while keeping the i18next instance.
  for (const [language, { translation }] of Object.entries(resources)) {
    i18next.addResourceBundle(language, "translation", translation);
  }
}

const translateSystem = i18next;
export default translateSystem;
