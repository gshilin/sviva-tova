import React from "react";

import Logo from "./Logo";
import SelectLanguage from "./SelectLanguage";
import TopNavLink from "./TopNavLink";

export const TopNav = ({ locale, languages, moreLinks = [], t }) => {
  const title = t("home.views.site_name");
  const home = t("stream.home");

  return (
    <nav className="rounded bg-gradient-to-b from-cyan-500 to-blue-900 h-5 p-5 mb-2.5 relative">
      <Logo locale={locale} title={title} />
      <SelectLanguage locale={locale} languages={languages} />
      {
        moreLinks.map(l => <TopNavLink title={l.title} to={l.to} key={l.title} pipe />)
      }
      <TopNavLink title={home} to={`/${locale}`} key={home} />
    </nav>
  );
};
