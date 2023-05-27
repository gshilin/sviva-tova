import { cssBundleHref } from "@remix-run/css-bundle";

import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import i18next from "./services/i18next.server";
import i18n from "./services/i18n";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { promiseHash } from "remix-utils";

import styles from "./tailwind.css";
import { Footer } from "./components/Footer";
import { languages } from "./services/models/languages.server";
import { useChangeLanguage } from "remix-i18next";
import { TopNav } from "./components/topnav/TopNav";
import { authenticator } from "./services/auth.server";
import { roles_users } from "./services/models/roles_users.server";

export const meta = ({ data }) => {
  return [
    { charset: "utf-8" },
    { title: data.title },
    { viewport: "width=device-width,initial-scale=1" },
    {
      property: "og:title",
      content: data.title
    },

    // you can now add SEO related <links>
    { tagName: "link", rel: "canonical", href: "..." }
  ];
};

export const links = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: styles }
];

export const loader = async ({ request, params }) => {
  const locale = params.locale || await i18next.getLocale(request);
  if (!i18n.supportedLngs.includes(locale)) {
    return redirect("/en/posts/all");
  }
  const user = await authenticator.isAuthenticated(request);
  const t = await i18next.getFixedT(request);

  const hash = {
    locale,
    title: t("home.views.site_name"),
    languages: languages.GetLanguages(),
    userId: user?.id,
    isAdmin: roles_users.IsAdmin(user?.id)
  };
  return json(await promiseHash(hash));
};

export default function App() {
  const { i18n, t } = useTranslation();
  const { locale, languages, userId, isAdmin } = useLoaderData();

  useChangeLanguage(locale);

  let moreLinks = [];
  if (userId) {
    moreLinks.push({
      title: t("views.signout"),
      to: "/logout"
    });
    if (isAdmin) {
      moreLinks.push({
        title: t("home.views.admin"),
        to: `/${locale}/admin/panel`
      });
    }
  }

  return (
    <html lang={locale} dir={i18n.dir()}>
    <head>
      <Meta />
      <Links />
    </head>
    <body className="bg-white font-sans text-sm leading-5 text-gray-500">
    <div className="block mt-5 bg-white top-0 w-full h-fit absolute">
      <div
        className="h-52 mx-auto my-0 border border-black border-opacity-100 rounded"
        style={{ width: 960 }}
      >
        AD
      </div>
    </div>
    <div
      className="shadow-[0px_0px_10px_0px_#666666] mt-64 mx-auto mb-5 p-2.5 bg-white rounded relative"
      style={{ width: 960, direction: i18n.dir() }}
    >
      <TopNav locale={locale} languages={languages} t={t} moreLinks={moreLinks} />
      <Outlet />
      <Footer t={t} />
    </div>
    <ScrollRestoration />
    <Scripts />
    <LiveReload />
    </body>
    </html>
  );
}
