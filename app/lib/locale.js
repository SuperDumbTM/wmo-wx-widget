/**
 * @typedef {('ar'|'en'|'tc'|'zh'|'fr'|'de'|'it'|'kr'|'pl'|'pt'|'ru'|'es')} WmoLocale
 */

mapping = {
  ar: "ar",
  en: "en",
  tc: "zh-Hant",
  zh: "zh-Hans",
  fr: "fr",
  de: "de",
  it: "it",
  kr: "ko",
  pl: "pl",
  pt: "pt",
  ru: "ru",
  es: "es",
};

/**
 * Translate the locale codes used by WMO to ISO639 codes.
 * @param {WmoLocale} locale
 * @returns {string}
 */
function wmoToIso639(locale) {
  return mapping[locale] || locale;
}

module.exports = {wmoToIso639};
