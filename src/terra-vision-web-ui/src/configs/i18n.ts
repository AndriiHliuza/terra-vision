import i18n from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import {initReactI18next} from "react-i18next";
import enTranslation from "../locales/en/translation.json";
import uaTranslation from "../locales/ua/translation.json";

i18n
    .use(I18nextBrowserLanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: {translation: enTranslation},
            ua: {translation: uaTranslation},
        }
    }).then();

export default i18n;