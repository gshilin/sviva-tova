import { Link, useFetcher, useLoaderData } from "@remix-run/react";

import { authenticator } from "../services/auth.server";
import { jsonHash } from "remix-utils";
import { useTranslation } from "react-i18next";
import { pages } from "../services/models/pages.server";
import { useEffect, useState } from "react";
import i18next from "../services/i18next.server";
import { redirect } from "@remix-run/server-runtime";

const streamsMap = {
  all: ["article", "message"],
  content: ["article"],
  messages: ["message"],
  projects: ["project"],
  events: ["event"]
};

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

export const action = async ({ request, params, context }) => {
  return redirect(request.url);
};

export const loader = async ({ request, params }) => {
  /* check the user to see if there is an active session, if not redirect to login page */
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login"
  });

  const locale = params.locale || await i18next.getLocale(request);
  const t = await i18next.getFixedT(request);
  const stream = params.stream;
  const url = new URL(request.url);
  const pageNo = url.searchParams.get("page") || 0;
  let streamTypes = streamsMap[stream] || ["article", "message"];

  return jsonHash({
    title: t("home.views.site_name"),
    locale,
    stream,
    result: pages.List({ locale, pageNo, streamTypes, withTags: true })
  });
};

const Post = (p, locale, t) => {
  return (
    <div key={p.id} id={`page-${p.id}`} className="relative border-b mt-2.5">
      {p.isSticky &&
        <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="yellow" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="absolute top-0 left-0">
          <line x1="12" x2="12" y1="17" y2="22"></line>
          <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
        </svg>
      }
      <h2 className="pb-5 mb-2.5 text-[#2971a7] text-center text-base font-bold">
        {
          <Link className="no-underline" to={`/${locale}/pages/${p.id}`} title={p.title}>
            {p.title}
          </Link>
        }
      </h2>
      {p.subtitle && <p><strong>{p.subtitle}</strong></p>}
      {p.picture4preview && <img src={p.picture4preview} />}
      <div className="block text-left mt-2.5 mr-5 text-xs post-description"
           dangerouslySetInnerHTML={{
             __html: p.description
           }}
      />
      <Link className="block text-right mt-2.5 mr-5 text-xs" to={`/${locale}/pages/${p.id}`} title={p.title}>{t("stream.read_all")}</Link>
      <div className="text-xs mb-2.5 pb-2.5"
           dangerouslySetInnerHTML={{
             __html: t("stream.posted_ago" + ":", {
               when: new Date(p.updatedAt).toLocaleDateString("ja-JP")
             })
           }}
      />

      {p.tags?.length > 0 && (
        <p className="mb-2.5 pb-5">
          {p.tags.map((tag) => (
            <Link className="whitespace-nowrap text-xs text-[#666] bg-[#ebf8ff] rounded-md relative no-underline px-2.5 py-0.5 leading-4 mr-1" key={tag} to={`${locale}/tag/${tag}`}>{tag}</Link>
          ))}
        </p>
      )}
    </div>
  );
};

export default function PostsAll() {
  const { t } = useTranslation();

  const { locale, stream, result } = useLoaderData();
  const [items, setItems] = useState(result.posts);
  const [sticky, setSticky] = useState(result.sticky);
  const [streamType, setStreamType] = useState(stream);
  const [more, setMore] = useState(result.posts.length === 10);
  const fetcher = useFetcher();

  useEffect(() => {
    setItems(() => result.posts);
    setSticky(() => result.sticky);
  }, [locale]);

  useEffect(() => {
    if (streamType !== stream) {
      setItems(() => result.posts);
      setSticky(() => result.sticky);
      setStreamType(() => stream);
      setMore(() => result.posts.length === 10);
    }
  }, [stream, streamType]);

  useEffect(() => {
    if (!fetcher.data || fetcher.state === "loading") {
      return;
    }
    if (fetcher.data) {
      const { result: { posts }, stream } = fetcher.data;
      if (streamType === stream) {
        setItems((prevAssets) => [...prevAssets, ...posts]);
      } else {
        setItems(() => [...posts]);
        setStreamType(stream);
      }
      setMore(posts.length === 10);
    }
  }, [fetcher.data]);

  return (
    <>
      {sticky.length > 0 && (
        <div className="border-[#dcf2ff] border-4 rounded pt-2 px-2 -mt-2.5 -mx-2.5 mb-2">
          {sticky.map((p) => Post(p, locale, t))}
        </div>
      )
      }
      {items?.map((p) => Post(p, locale, t))}
      {more && (
        <a
          onClick={() => {
            const page = fetcher.data
              ? +fetcher.data.result.page + 1
              : +result.page + 1;
            const query = `/${locale}/posts/${streamType}?page=${page}`;
            fetcher.load(query);
          }}
        >
          {t("stream.more_items")}
        </a>
      )}
    </>
  );
}
