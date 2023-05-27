import { Link } from "@remix-run/react";
import React from "react";

const Logo = ({ locale, title }) => (
  <div className="absolute top-0 left-0">
    <Link to={`/${locale}`} title={title} className="text-[#2971a7]">
      <img src={`/images/logo-${locale}.png`} alt={title} />
    </Link>
    <h1 className="absolute top-[-1000px]">{title}</h1>
  </div>
);

export default Logo;
