import { translatePathname } from "./routes";
import { ui } from "./ui";

export const LANGUAGES = {
  en: "English",
  it: "Italiano"
};

export const DEFAULT_LANG = "en";

export type UiType = keyof typeof ui;

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split("/");
  if (lang in ui) return lang as UiType;
  return DEFAULT_LANG;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof DEFAULT_LANG]) {
    return ui[lang][key] || ui[DEFAULT_LANG][key];
  }
}

export function pathNameIsInLanguage(pathname: string, lang: UiType) {
  return pathname.startsWith(`/${lang}`) || (lang === DEFAULT_LANG && !pathNameStartsWithLanguage(pathname));
}

function pathNameStartsWithLanguage(pathname: string) {
  let startsWithLanguage = false;
  const languages = Object.keys(LANGUAGES);

  for (let i = 0; i < languages.length; i++) {
    const lang = languages[i];
    if (pathname.startsWith(`/${lang}`)) {
      startsWithLanguage = true;
      break;
    }
  }

  return startsWithLanguage;
}

/**
 * Counterpart of `pathname` in `lang`. Delegates to the route map so that
 * sections with localized slugs (services) switch language correctly.
 */
export function getLocalizedPathname(pathname: string, lang: UiType) {
  return translatePathname(pathname, lang);
}
