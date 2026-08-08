import * as Localization from 'expo-localization';
import en from './en';
import es from './es';
import fr from './fr';
import pt from './pt';
import { languages } from './languages';

export { languages };

export const translations = { pt, en, es, fr };

export const getSystemLanguage = () => {
  const systemLanguage = Localization.getLocales()[0]?.languageCode;
  return translations[systemLanguage] ? systemLanguage : 'pt';
};

export const getLocale = (language) =>
  languages.find(({ code }) => code === language)?.locale || 'pt-BR';
