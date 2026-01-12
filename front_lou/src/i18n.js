import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'


i18next
    .use(Backend)
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        lng: localStorage.getItem('lang') || 'en',
        debug: true,
        fallbackLng: 'en'
    })