import { Link, useMatches } from "@remix-run/react";
import React from "react";

export const LeftNav = ({ t, locale, totalPosts, totalArticles, totalMessages, totalProjects, totalEvents, topics }) => {
  const matches = useMatches();
  console.table(matches);
  return <nav>
    <ul className="border-b-2 pb-2 mb-2">
      <li className="block hover:bg-[#2971a7]">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="inline pr-1.5"></svg>
        <Link className="hover:text-white font-bold text-black" to={`/${locale}/posts/all`}>{`${t("admin.pages.all_posts")} (${totalPosts})`}</Link></li>
      <li className="block hover:bg-[#2971a7] hover:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="inline pr-1.5">
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <path d="M12 11h4"></path>
          <path d="M12 16h4"></path>
          <path d="M8 11h.01"></path>
          <path d="M8 16h.01"></path>
        </svg>
        <Link className="hover:text-white font-bold text-black" to={`/${locale}/posts/content`}>{`${t("admin.pages.content")} (${totalArticles})`}</Link></li>
      <li className="block hover:bg-[#2971a7] hover:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="inline pr-1.5">
          <rect width="20" height="16" x="2" y="4" rx="2"></rect>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
        </svg>
        <Link className="hover:text-white font-bold text-black" to={`/${locale}/posts/messages`}>{`${t("admin.pages.messages")} (${totalMessages})`}</Link></li>
      <li className="block hover:bg-[#2971a7] hover:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="inline pr-1.5">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
          <circle cx="12" cy="13" r="2"></circle>
          <path d="M12 10v1"></path>
          <path d="M12 15v1"></path>
          <path d="m14.6 11.5-.87.5"></path>
          <path d="m10.27 14-.87.5"></path>
          <path d="m14.6 14.5-.87-.5"></path>
          <path d="m10.27 12-.87-.5"></path>
        </svg>
        <Link className="hover:text-white font-bold text-black" to={`/${locale}/posts/projects`}>{`${t("stream.projects")} (${totalProjects})`}</Link></li>
      <li className="block hover:bg-[#2971a7] hover:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="inline pr-1.5">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
          <line x1="16" x2="16" y1="2" y2="6"></line>
          <line x1="8" x2="8" y1="2" y2="6"></line>
          <line x1="3" x2="21" y1="10" y2="10"></line>
          <path d="M8 14h.01"></path>
          <path d="M12 14h.01"></path>
          <path d="M16 14h.01"></path>
          <path d="M8 18h.01"></path>
          <path d="M12 18h.01"></path>
          <path d="M16 18h.01"></path>
        </svg>
        <Link className="hover:text-white font-bold text-black" to={`/${locale}/posts/events`}>{`${t("admin.pages.events")} (${totalEvents})`}</Link></li>
    </ul>
    {topics.length > 0 &&
      <>
        <h4 className="mb-2.5">{t("stream.tags_menu")}:</h4>
        <ul className="text-xs leading-5">
          {topics.map(t => <li key={t.id} className="block hover:bg-[#2971a7]"><Link className="hover:text-white" to={`/${locale}/tag/${t.name}`}>{t.name}</Link></li>)}
        </ul>
      </>
    }
  </nav>;
};
