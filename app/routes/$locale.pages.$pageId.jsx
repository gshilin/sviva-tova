import { useLoaderData } from "@remix-run/react";

import { authenticator } from "../services/auth.server";
import { jsonHash, safeRedirect } from "remix-utils";
import { pages } from "../services/models/pages.server";
import { redirect } from "@remix-run/server-runtime";
import i18next from "../services/i18next.server";
import { RealTimeBroadcast } from "../components/broadcast/RealTimeBroadcast";

export const meta = ({ data: { title, page } }) => {
  const metadata = [
    { charset: "utf-8" },
    { title: title },
    { viewport: "width=device-width,initial-scale=1" },
    {
      property: "og:title",
      content: title
    },

    // you can now add SEO related <links>
    { tagName: "link", rel: "canonical", href: "..." }
  ];
  return metadata;
};

const scripts = ({
                   id,
                   data: { title, page },
                   params,
                   location,
                   parentsData
                 }) => {
  const metadata = [];
  if (page && Array.isArray(page.tags) && page.tags[0] === "webrtc") {
    metadata.push({
      src: "https://v4g.kbb1.com/video/js/adapter.js"
    });
    metadata.push({
      src: "https://v4g.kbb1.com/video/js/janus.js"
    });
    metadata.push({
      // TODO src: "https://v4g.kbb1.com/video/js/client-api.js"
      src: "/scripts/client-api.js"
    });
  }
  return metadata;
};

export const handle = { scripts };

export const action = async ({ request }) => {
  return redirect(safeRedirect(request.url, "/"));
};

export const loader = async ({ request, params }) => {
  /* check the user to see if there is an active session, if not redirect to login page */
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login"
  });
  const t = await i18next.getFixedT(request);

  return jsonHash({
    title: t("home.views.site_name"),
    page: pages.Get({ pageId: params.pageId })
  });
};

const Asset = ({ asset }) => {
  switch (asset.resourceType) {
    case "ArticleResource":
      const article = asset.articles[0];
      return (
        <div className="my-5">
          <h4 className="mb-2.5 font-bold">{article.name}</h4>
          <div className="message-body"
               dangerouslySetInnerHTML={{
                 __html: article.body
               }}
          />
        </div>
      );
    case "AudioResource":
      const audio = asset.audios[0];
      return (
        <div className="my-5">
          <h4 className="mb-2.5 font-bold">{audio.name}</h4>
          <div className="message-body"
               dangerouslySetInnerHTML={{
                 __html: audio.description
               }}
          />
          {audio.embed &&
            <div className="message-body"
                 dangerouslySetInnerHTML={{
                   __html: audio.embed
                 }}
            />
          }
          {!audio.embed && <div>Not supported</div>}
        </div>
      );
    case "VideoResource":
      const video = asset.videos[0];
      return (
        <div className="my-5">
          <h4 className="mb-2.5 font-bold">{video.name}</h4>
          <div className="message-body"
               dangerouslySetInnerHTML={{
                 __html: video.description
               }}
          />
          {video.embed &&
            <div className="message-body"
                 dangerouslySetInnerHTML={{
                   __html: video.embed
                 }}
            />
          }
          {!video.embed && <div>Not supported</div>}
        </div>
      );
    default:
      return <h1>Unsupported resource type: ${asset.resourceType}</h1>;
  }
};

const Event = ({ event }) => {
  const { tags = [] } = event;
  switch (tags[0]) {
    case "webrtc":
      return <div>
        <RealTimeBroadcast event={event} />
        <div id="services">
          <div className="tabs">
            <span>%= link_to I18n.t('kabtv.kabtv.questions'), '#', :onclick = 'return kabtv.tabs.select_me(this, "questions")' %</span>
            <span className="schedule">%= link_to I18n.t('kabtv.kabtv.schedule'), '#', :onclick = 'return kabtv.tabs.select_me(this, "schedule")' %</span>
            <span>%= link_to I18n.t('kabtv.kabtv.sketches'), '#', :onclick = 'return kabtv.tabs.select_me(this, "sketches")' %</span>
          </div>
          <div className="content">content</div>
        </div>
        <div>form</div>
        <div>donate</div>
      </div>;
    case "webrtc4":
      return <AjustingTranslationVolume event={event} />;
    default:
      return <Stream event={event} />;
  }
};

export default function Pages() {
  const { page } = useLoaderData();

  if (page === null) {
    return <h1>404 -- Not Found</h1>;
  }

  return (
    <div className="border-[#dcf2ff] border-4 rounded pt-2 px-2 -mt-2.5 -mx-2.5 mb-2">
      <h1 className="mt-2.5 mb-5 text-center text-lg font-bold">{page.title}</h1>
      <h5 className="mb-4 text-center font-bold font-sm">{page.subtitle}</h5>
      {page.pageType === "message" &&
        <div className="message-body"
             dangerouslySetInnerHTML={{
               __html: page.messageBody
             }}
        />
      }
      {(page.pageType === "project" || page.pageType === "article") &&
        page.assets.map(asset => {
          return <Asset key={`${page.id}-${asset.id}`} asset={asset} />;
        })
      }
      {page.pageType === "message" &&
        page.assets.map(asset => {
          return <Asset key={`${page.id}-${asset.id}`} asset={asset} />;
        })
      }
      {page.pageType === "event" &&
        <Event event={page} />
      }
    </div>
  );
}
