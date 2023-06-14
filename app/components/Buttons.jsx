import { Link } from "@remix-run/react";

export const Buttons = ({ buttons }) => {
  return <div className="text-center">
    {buttons.map(b =>
      <Link key={b.href} to={b.href} target="_blank" className={b.klass}>
        {b.text}
        {b.subtext && <br />}
        {b.subtext && <span>{b.subtext}</span>}
      </Link>
    )}
  </div>;
};
