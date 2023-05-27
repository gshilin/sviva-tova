import { Link } from "@remix-run/react";
import React from "react";

const TopNavLink = ({ title, to, pipe = false }) => (
  <div className="float-right ml-2 relative top-[-0.6rem] right-[-0.6rem]">
    {pipe && <span className="text-white mr-2">|</span>}<Link to={to} title={title} className="text-white">{title}</Link>
  </div>
);

export default TopNavLink;
