import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import i18next from "i18next";
import Backend from "i18next-http-backend";
import i18n from "./services/i18n";
import { getInitialNamespaces } from "remix-i18next";

async function hydrate() {
  await i18next
    .use(initReactI18next)
    .use(LanguageDetector) // Setup a client-side language detector
    .use(Backend)
    .init({
      ...i18n,
      ns: getInitialNamespaces(),
      backend: {
        loadPath: "/locales/{{lng}}/{{ns}}.json"
      }
    });

  startTransition(() => {
    // Wrap RemixBrowser in I18nextProvider
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <StrictMode>
          <RemixBrowser />
        </StrictMode>
      </I18nextProvider>
    );
  });
}

// After i18next init, hydrate the app
if (typeof requestIdleCallback === "function") {
  requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  setTimeout(hydrate, 1);
}
