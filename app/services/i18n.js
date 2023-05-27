export default {
  supportedLngs: ["bg", "de", "en", "es", "ge", "he", "hr", "it", "pl", "pt", "ro", "ru", "sv", "tr", "uk"],
  fallbackLng: "en",
  defaultNS: "translation",
  // Disabling suspense is recommended
  react: { useSuspense: false },
  detection: {
    order: ["path", "querystring", "cookie", "htmlTag"]
  }

  // TODO remove
  // debug: true
};
