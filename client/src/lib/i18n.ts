import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "../locales/en.json";
import heTranslation from "../locales/he.json";

// Initialize i18next instance
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      he: {
        translation: heTranslation
      }
    },
    lng: localStorage.getItem("language") || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // React already protects from XSS
    }
  });

export default i18n;
