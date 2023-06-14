import { Link } from "@remix-run/react";

export const Feed = ({ t, feed }) => {
  if (!feed) {
    return;
  }
  feed = feed.rss.channel[0].item;
  return (<div className="mb-5 rounded-md p-2.5 border-2 border-opacity-100 border-gray-300">
    <Link to={t("home.views.blog")} target={"_blank"}
          className="text-[#f7931e] font-bold italic text-sm block mb-2.5 border-b-2 border-b-gray-300"
    >{t("home.views.blog_title")}</Link>
    <ul className="ml-4 text-[#f7931e list-disc list-outside">
      {feed.map(f => <li key={f.link[0]}>
        <Link to={f.link[0]} target={"_blank"}>{f.title[0]}</Link>
        <span className="block text-[#aaa] text-xs"
              dangerouslySetInnerHTML={{
                __html: t("stream.posted_ago", {
                  when: (new Date(f.pubDate[0])).toLocaleDateString("ja-JP")
                })
              }}
        />
      </li>)
      }
    </ul>
    <Link to={t("home.views.feed")} target={"_blank"} className="block text-right mt-5 text-xs">{t("stream.read_all")}</Link>
  </div>);
};
