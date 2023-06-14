import { Link } from "@remix-run/react";
import { Buttons } from "./Buttons";
import { Feed } from "./Feed";
import { useTranslation } from "react-i18next";

export const RightNav = ({ buttons, links, feed }) => {
  const { t } = useTranslation();

  return <>
    <Buttons buttons={buttons} />
    <div className="mb-5 rounded-md p-2.5 border-2 border-opacity-100 border-gray-300">
      <ul className="ml-4 text-[#f7931e list-disc list-outside">
        {
          links.map(l => <li key={l.to}>
            <Link to={l.to} target="_blank" style={{ color: l.color }}>{l.text}</Link>
          </li>)
        }
      </ul>
    </div>
    <Feed feed={feed} t={t} />
  </>;
};
