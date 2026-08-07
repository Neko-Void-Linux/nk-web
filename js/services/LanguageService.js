export function detectLanguageFromTimezone() {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneToLanguage = {
      "America/Mexico_City": "es",
      "America/Bogota": "es",
      "America/Lima": "es",
      "America/Santiago": "es",
      "America/Argentina/Buenos_Aires": "es",
      "America/Montevideo": "es",
      "America/Caracas": "es",
      "America/Guatemala": "es",
      "America/San_Salvador": "es",
      "America/Tegucigalpa": "es",
      "America/Managua": "es",
      "America/Costa_Rica": "es",
      "America/Panama": "es",
      "America/Havana": "es",
      "America/Santo_Domingo": "es",
      "America/Puerto_Rico": "es",
      "America/La_Paz": "es",
      "America/Quito": "es",
      "America/Asuncion": "es",
      "Europe/Madrid": "es",
      "Atlantic/Canary": "es",
      "Africa/Ceuta": "es",
      "Asia/Tokyo": "ja",
    };
    if (timezoneToLanguage[timeZone]) return timezoneToLanguage[timeZone];
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang) {
      const langCode = browserLang.split("-")[0].toLowerCase();
      if (["en", "es", "ja"].includes(langCode)) return langCode;
    }
    return "en";
  } catch (error) {
    console.warn("Error detecting language from timezone:", error);
    return "en";
  }
}
