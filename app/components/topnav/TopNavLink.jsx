import { Link } from "@remix-run/react";
import React from "react";

const TopNavLink = ({ title, to, pipe = false }) => (
  <div className="float-right ms-2 relative -top-2.5 -right-2.5">
    {pipe && <span className="text-white mr-2">|</span>}<Link to={to} title={title} className="text-white">{title}</Link>
  </div>
);

export default TopNavLink;
