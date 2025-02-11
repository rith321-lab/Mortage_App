import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      common: {
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success'
      },
      mortgage: {
        application: 'Mortgage Application',
        status: 'Application Status',
        documents: 'Required Documents',
        review: 'Application Review'
      }
      // Add more translations
    }
  },
  es: {
    translation: {
      // Spanish translations
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 