import { LeftNav } from "./LeftNav";
import { Outlet } from "@remix-run/react";
import { RightNav } from "./RightNav";
import { useTranslation } from "react-i18next";

export const Layout = ({ loaderData }) => {
  const { t } = useTranslation();
  const {
    locale, buttons, links, feed,
    totalPosts, totalArticles, totalMessages, totalProjects, totalEvents, topics
  } = loaderData;

  return (
    <>
      <div className="grid grid-cols-12">
        <div className="col-span-2">
          <LeftNav locale={locale}
                   totalPosts={totalPosts} totalArticles={totalArticles}
                   totalMessages={totalMessages} totalProjects={totalProjects}
                   totalEvents={totalEvents}
                   topics={topics}
          />
        </div>
        <div className="col-span-7 p-2.5 border-[#dcf2ff] border-2 rounded">
          <Outlet />
        </div>
        <div className="col-span-3">
          <RightNav buttons={buttons} links={links} feed={feed} />
        </div>
      </div>
    </>
  );
};
