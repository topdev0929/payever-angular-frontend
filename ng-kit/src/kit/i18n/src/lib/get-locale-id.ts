export function getLocaleId(lang: string): string {
  const TEMP_HACK_FOR_NO_LOCALE: string = lang === 'no' ? 'nb' : lang;
  const localeId: string = lang === 'en' ? 'en-DE' : TEMP_HACK_FOR_NO_LOCALE;
  return localeId;
}
