import { Link, useFetcher, useLoaderData } from "@remix-run/react";

import { authenticator } from "../services/auth.server";
import { languages } from "../services/models/languages.server";
import { json } from "@remix-run/node";
import { promiseHash } from "remix-utils";
import { useTranslation } from "react-i18next";
import { pages } from "../services/models/pages.server";
import { useEffect, useState } from "react";
import { LeftNav } from "../components/LeftNav";
import { tags } from "../services/models/tags.server";
import { taggings } from "../services/models/taggings.server";
import i18next from "../services/i18next.server";
import { parseString } from "xml2js";
import axios from "axios";
import { redirect } from "@remix-run/server-runtime";

const streamsMap = {
  all: ["article", "message"],
  content: ["article"],
  messages: ["message"],
  projects: ["project"],
  events: ["event"]
};

const getButtons = async (locale) => {
  switch (locale) {
    case  "ru":
      return [
        {
          href: "https://kli.one?lang=ru",
          klass: "middle-second orange",
          text: "Виртуальный дом",
          subtext: "Внести абонентскую плату »"
        },
        {
          href: "https://www.kabbalah.info/maaser/rus/",
          klass: "middle-second green",
          text: "Внести Маасер"
        },
        {
          href: "https://kabbalahgroup.info/internet/ru/pages/23931",
          klass: "middle-second red",
          text: "Help Haver"
        },
        {
          href: "https://docs.google.com/forms/d/e/1FAIpQLSe-48q7PHhr6qmmaRN5jlQGeSXUeEs6f_5O1LQVgYnTCQzUjw/viewform?c=0&w=1",
          klass: "middle-second blue",
          text: "Пишите Нам"
        },
        {
          href: "https://docs.google.com/document/d/1GuBpmu9yWZseaAXEciJpQ5lXGLld1E72o2y4_9Fi-m0/edit",
          klass: "middle-second orange",
          text: "Прибытие в ПТ"
        },
        {
          href: "https://docs.google.com/document/d/1sE0vuj5Qxa8RTlZmUqoCOp8HqAove066qXsa3Y_GY1k/edit#",
          klass: "middle-second blue",
          text: "Список открытых вакансий"
        },
        {
          href: "https://www.kab1.com/ru?utm_source=sviva_tova&utm_medium=banner&utm_campaign=donations&utm_id=donations&utm_term=rus&utm_content=side_banner_bou_lehyot_shutafim",
          klass: "donation donation-ru",
          text: ""
        }
      ];
    case "es":
      return [
        {
          href: "https://kli.one?lang=es",
          klass: "middle-second orange",
          text: "Hogar Virtual",
          subtext: "Pagar tarifa de usuario »"
        },
        {
          href: "https://www.kabbalah.info/maaser/spa/",
          klass: "middle-second green",
          text: "Pagar Maaser"
        },
        {
          href: "https://kabbalahgroup.info/internet/es/pages/23964",
          klass: "middle-second red",
          text: "Help Haver"
        },
        {
          href: "https://docs.google.com/forms/d/e/1FAIpQLSe-48q7PHhr6qmmaRN5jlQGeSXUeEs6f_5O1LQVgYnTCQzUjw/viewform?c=0&w=1",
          klass: "middle-second blue",
          text: "Escribenos"
        },
        {
          href: "https://docs.google.com/document/d/1GuBpmu9yWZseaAXEciJpQ5lXGLld1E72o2y4_9Fi-m0/edit",
          klass: "middle-second orange",
          text: "Arrivo a Petaj Tikva"
        },
        {
          href: "https://www.kab1.com/es?utm_source=sviva_tova&utm_medium=banner&utm_campaign=donations&utm_id=donations&utm_term=spa&utm_content=side_banner_bou_lehyot_shutafim",
          klass: "donation donation-es",
          text: ""
        }
      ];
    case "he":
      return [
        {
          href: "https://kli.one?lang=he",
          klass: "middle-second orange",
          text: "הבית הווירטואלי",
          subtext: "לתשלום עבור השירות »"
        },
        {
          href: "https://bit.ly/336DInv",
          klass: "middle-second green",
          text: "תפקידים בהפצה",
          subtext: "לפרטים והרשמה »"
        },
        {
          href: "https://campus.kab.co.il/landing/kab-virtual-course/?utm_source=sviva_tova&utm_medium=side_bar_arrow&utm_campaign=virtual_campus_may_20&utm_term=&utm_content=organic",
          klass: "middle-second blue",
          text: "קמפוס וירטואלי 2021"
        },
        {
          href: "https://www.kabbalah.info/maaser/heb/",
          klass: "middle-second green",
          text: "לתת מעשר"
        },
        {
          href: "https://kabbalahgroup.info/internet/he/pages/23943",
          klass: "middle-second red",
          text: "Help Haver"
        },
        {
          href: "https://docs.google.com/forms/d/e/1FAIpQLSe-48q7PHhr6qmmaRN5jlQGeSXUeEs6f_5O1LQVgYnTCQzUjw/viewform?c=0&w=1",
          klass: "middle-second blue",
          text: "כתבו לנו"
        },
        {
          href: "https://docs.google.com/document/d/1GuBpmu9yWZseaAXEciJpQ5lXGLld1E72o2y4_9Fi-m0/edit",
          klass: "middle-second orange",
          text: "התמחות"
        },
        {
          href: "https://www.kab1.com/?utm_source=sviva_tova&utm_medium=banner&utm_campaign=donations&utm_id=donations&utm_term=heb&utm_content=side_banner_bou_lehyot_shutafim",
          klass: "donation donation-he",
          text: ""
        },
        {
          href: "https://icecast.kab.tv/radiozohar2014.mp3",
          klass: "middle-second radiozohar",
          text: ""
        },
        {
          href: "https://soundcloud.com/kabbalah-laam-music",
          klass: "middle-second music",
          text: ""
        }
      ];
    case "pt":
      return [
        {
          href: "https://kli.one?lang=es",
          klass: "middle-second orange",
          text: "Hogar Virtual",
          subtext: "Pagar tarifa de usuario »"
        },
        {
          href: "https://www.kabbalah.info/maaser/pt/",
          klass: "middle-second green",
          text: "Dar Maaser"
        },
        {
          href: "https://kabbalahgroup.info/internet/ru/pages/23948",
          klass: "middle-second red",
          text: "Ajuda Amigo"
        },
        {
          href: "https://docs.google.com/forms/d/e/1FAIpQLSe-48q7PHhr6qmmaRN5jlQGeSXUeEs6f_5O1LQVgYnTCQzUjw/viewform?c=0&w=1",
          klass: "middle-second blue",
          text: "Escreva-nos"
        },
        {
          href: "https://docs.google.com/document/d/1GuBpmu9yWZseaAXEciJpQ5lXGLld1E72o2y4_9Fi-m0/edit",
          klass: "middle-second orange",
          text: "Arrivo a Petaj Tikva"
        },
        {
          href: "https://www.kab1.com/es?utm_source=sviva_tova&utm_medium=banner&utm_campaign=donations&utm_id=donations&utm_term=spa&utm_content=side_banner_bou_lehyot_shutafim",
          klass: "donation donation-es",
          text: ""
        }
      ];
    case "tr":
      return [
        {
          href: "https://kli.one?lang=en",
          klass: "middle-second orange",
          text: "Virtual Home",
          subtext: "Pay User Fee »"
        },
        {
          href: "https://www.kabbalah.info/maaser/eng/",
          klass: "middle-second green",
          text: "Give Maaser"
        },
        {
          href: "https://kabbalahgroup.info/internet/ru/pages/23948",
          klass: "middle-second red",
          text: "Help Haver"
        },
        {
          href: "https://docs.google.com/forms/d/e/1FAIpQLSe-48q7PHhr6qmmaRN5jlQGeSXUeEs6f_5O1LQVgYnTCQzUjw/viewform?c=0&w=1",
          klass: "middle-second blue",
          text: "Write to us"
        },
        {
          href: "https://docs.google.com/document/d/1GuBpmu9yWZseaAXEciJpQ5lXGLld1E72o2y4_9Fi-m0/edit",
          klass: "middle-second orange",
          text: "Stajyerlik"
        },
        {
          href: "https://www.kab1.com/en?utm_source=sviva_tova&utm_medium=banner&utm_campaign=donations&utm_id=donations&utm_term=other_lang&utm_content=side_banner_bou_lehyot_shutafim",
          klass: "donation donation-en",
          text: ""
        }
      ];
    case "uk":
      return [
        {
          href: "https://kli.one?lang=en",
          klass: "middle-second orange",
          text: "Виртуальный дом",
          subtext: "Внести абонентскую плату »"
        },
        {
          href: "https://www.kabbalah.info/maaser/ua/",
          klass: "middle-second green",
          text: "Внести Маасер"
        },
        {
          href: "https://kabbalahgroup.info/internet/uk#pages/37404",
          klass: "middle-second red",
          text: "Help Haver"
        },
        {
          href: "https://docs.google.com/forms/d/e/1FAIpQLSe-48q7PHhr6qmmaRN5jlQGeSXUeEs6f_5O1LQVgYnTCQzUjw/viewform?c=0&w=1",
          klass: "middle-second blue",
          text: "Написати нам"
        },
        {
          href: "https://docs.google.com/document/d/1GuBpmu9yWZseaAXEciJpQ5lXGLld1E72o2y4_9Fi-m0/edit",
          klass: "middle-second orange",
          text: "Стажування"
        },
        {
          href: "https://docs.google.com/document/d/1DRhJiUdLFIOwZUCuyRgqDsz_56DBzKQ0P0n95do4E0U/edit?ts=5ad755f8",
          klass: "middle-second blue",
          text: "Список відкритих вакансій"
        },
        {
          href: "https://www.kab1.com/ru?utm_source=sviva_tova&utm_medium=banner&utm_campaign=donations&utm_id=donations&utm_term=rus&utm_content=side_banner_bou_lehyot_shutafim",
          klass: "donation donation-en",
          text: ""
        }
      ];
    default:
      return [
        {
          href: "https://kli.one?lang=en",
          klass: "middle-second orange",
          text: "Virtual Home",
          subtext: "Pay User Fee »"
        },
        {
          href: "https://www.kabbalah.info/maaser/eng/",
          klass: "middle-second green",
          text: "Give Maaser"
        },
        {
          href: "https://kabbalahgroup.info/internet/en/pages/23948",
          klass: "middle-second red",
          text: "Help Haver"
        },
        {
          href: "https://docs.google.com/forms/d/e/1FAIpQLSe-48q7PHhr6qmmaRN5jlQGeSXUeEs6f_5O1LQVgYnTCQzUjw/viewform?c=0&w=1",
          klass: "middle-second blue",
          text: "Write to us"
        },
        {
          href: "https://docs.google.com/document/d/1GuBpmu9yWZseaAXEciJpQ5lXGLld1E72o2y4_9Fi-m0/edit",
          klass: "middle-second orange",
          text: "Arrival to Petah Tiqva"
        },
        {
          href: "https://www.kab1.com/en?utm_source=sviva_tova&utm_medium=banner&utm_campaign=donations&utm_id=donations&utm_term=eng&utm_content=side_banner_bou_lehyot_shutafim",
          klass: "donation donation-en",
          text: ""
        }
      ];
  }
};

const getLinks = async (locale) => {
  switch (locale) {
    case "he":
      return [
        {
          text: "הכיוון היומי",
          to: "https://goo.gl/L2NE4F"
        },
        {
          text: "שאלות לרב",
          to: "https://bit.ly/bb-ask"
        },
        {
          text: "לוח שידורים - \"קבלה לעם\"",
          to: "https://cal.kli.one/heb",
          color: "red"
        },
        {
          text: "לו\"ז אירועים",
          to: "https://docs.google.com/spreadsheets/d/1NQnXe40m-Wx0q56qJ_vNIsc8QFUtl8gPyQ-W9m6KPoY/edit",
          color: "green"
        },
        {
          text: "מאמר הצהריים להשמעה חוזרת",
          to: "https://drive.google.com/folderview?id=0B3S5k1M0sUkEWHFITHd4Z1BQalk&usp=drive_web"
        }
      ];
    case "ru":
      return [
        {
          text: "Направление дня",
          to: "https://goo.gl/iLdDss"
        },
        {
          text: "Задать вопрос Раву",
          to: "https://bit.ly/bb-ask"
        },
        {
          text: "Расписание трансляций - \"Каббала леАм\"",
          to: "https://cal.kli.one/rus",
          color: "red"
        },
        {
          text: "Расписание Мероприятий",
          to: "https://docs.google.com/spreadsheets/d/1NQnXe40m-Wx0q56qJ_vNIsc8QFUtl8gPyQ-W9m6KPoY/edit",
          color: "green"
        },
        {
          text: "HelpHaver",
          to: "https://checkout.kabbalah.info/ru/payments/new?project_id=help_friend"
        },
        {
          text: "Уроки иврита для занимающихся каббалой",
          to: "https://www.kabhebrew.info/"
        },
        {
          text: "Карта Мирового Кли ББ",
          to: "https://bit.ly/groupmap"
        }
      ];
    case "es":
      return [
        {
          text: "Preguntas para Rav",
          to: "https://bit.ly/bb-ask"
        },
        {
          text: "Programa de transmisión - \"Cabalá Laam\"",
          to: "https://cal.kli.one/spa",
          color: "red"
        },
        {
          text: "Horario de eventos",
          to: "https://docs.google.com/spreadsheets/d/1NQnXe40m-Wx0q56qJ_vNIsc8QFUtl8gPyQ-W9m6KPoY/edit",
          color: "green"
        },
        {
          text: "HelpHaver",
          to: "https://checkout.kabbalah.info/es/payments/new?project_id=help_friend"
        },
        {
          text: "Seguimos navegando",
          to: "https://www.kabbalahgroup.info/spa/new/"
        }
      ];
    case "de":
      return [
        {
          text: "Daily Direction",
          to: "https://goo.gl/cXAQJK"
        },
        {
          text: "Kabbalah L'Am- Broadcast Schedule",
          to: "https://cal.kli.one/eng",
          color: "red"
        },
        {
          text: "Veranstaltungsplan",
          to: "https://docs.google.com/spreadsheets/d/1NQnXe40m-Wx0q56qJ_vNIsc8QFUtl8gPyQ-W9m6KPoY/edit",
          color: "green"
        },
        {
          text: "Questions for Rav",
          to: "https://bit.ly/bb-ask"
        },
        {
          text: "HelpHaver",
          to: "https://checkout.kabbalah.info/de/payments/new?project_id=help_friend"
        },
        {
          text: "Hebräisch-Unterricht für Kabbala-Studierende",
          to: "https://www.kabhebrew.info/english_1.htm"
        }
      ];
    case "pt":
      return [
        {
          text: "Daily Direction",
          to: "https://docs.google.com/document/d/1Yv1Ezu3g-SktpEfhP58IWfiQ_EOvjnaUgPBMN5nGyv4/edit?usp=sharing"
        },

        {
          text: "Questions for Rav",
          to: "https://bit.ly/bb-ask"
        },

        {
          text: "Ajuda Amigo",
          to: "https://checkout.kabbalah.info/en/payments/new?project_id=help_friend"
        },

        {
          text: "Programa de transmisión - \"Cabalá Laam\"",
          to: "https://cal.kli.one/spa",
          color: "red"
        },

        {
          text: "Agenda de eventos",
          to: "https://docs.google.com/spreadsheets/d/1NQnXe40m-Wx0q56qJ_vNIsc8QFUtl8gPyQ-W9m6KPoY/edit",
          color: "green"
        },

        {
          text: "Lições de Hebraico para Aqueles que Estudam Cabala",
          to: "https://www.kabhebrew.info/english_1.htm"
        },

        {
          text: "Mapa Mundial do Kli BB",
          to: "https://bit.ly/groupmap"
        }
      ];
    case "uk":
      return [
        {
          text: "Направление дня",
          to: "https://goo.gl/iLdDss"
        },
        {
          text: "Запитання Раву",
          to: "https://bit.ly/bb-ask"
        },
        {
          text: "Kabbalah L'Am- Broadcast Schedule",
          to: "https://cal.kli.one/eng",
          color: "red"
        },
        {
          text: "Розклад заходів",
          to: "https://docs.google.com/spreadsheets/d/1NQnXe40m-Wx0q56qJ_vNIsc8QFUtl8gPyQ-W9m6KPoY/edit",
          color: "green"
        },
        {
          text: "HelpHaver",
          to: "https://neworg.kbb1.com/ru/civicrm/contribute/transact?cid=0&reset=1&id=48"
        },
        {
          text: "Уроки кабалістичного івриту",
          to: "https://www.kabhebrew.info/"
        },
        {
          text: "Карта Світого Клі ББ",
          to: "https://bit.ly/groupmap"
        }
      ];
    default:
      return [
        {
          text: "Daily Direction",
          to: "https://goo.gl/cXAQJK"
        },
        {
          text: "Questions for Rav",
          to: "https://bit.ly/bb-ask"
        },
        {
          text: "Kabbalah L'Am- Broadcast Schedule",
          to: "https://cal.kli.one/eng",
          color: "red"
        },
        {
          text: "Events Schedule",
          to: "https://docs.google.com/spreadsheets/d/1NQnXe40m-Wx0q56qJ_vNIsc8QFUtl8gPyQ-W9m6KPoY/edit",
          color: "green"
        },
        {
          text: "HelpHaver",
          to: "https://checkout.kabbalah.info/en/payments/new?project_id=help_friend"
        },
        {
          text: "BB World Kli Map",
          to: "https://bit.ly/groupmap"
        }
      ];
  }
};

const getFeed = async (feedUrl) => {
  try {
    const response = await axios.get(feedUrl);
    const result = await new Promise((resolve, reject) => {
      parseString(response.data, (error, parsedData) => {
        if (error) {
          reject(error);
        } else {
          resolve(parsedData);
        }
      });
    });
    return result;
  } catch (error) {
    throw new Error("Error fetching data:", error);
  }
};

export const loader = async ({ request, params }) => {
  const stream = params.stream;
  const locale = params.locale || await i18next.getLocale(request);
  const t = await i18next.getFixedT(request);

  /* check the user to see if there is an active session, if not redirect to login page */
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login"
  });

  const url = new URL(request.url);
  const pageNo = url.searchParams.get("page") || 0;
  let streamTypes = streamsMap[stream] || ["article", "message"];

  const [language_id, tag_ids] = await Promise.all([
    languages.GetIdByLocale(locale),
    taggings.List(locale)
  ]);

  const hash = {
    locale,
    stream,
    result: pages.List({ locale, pageNo, streamTypes, withTags: true }),
    buttons: getButtons(locale),
    links: getLinks(locale),
    feed: getFeed(t("home.views.feed")),
    totalPosts: pages.CountPublished(language_id),
    totalArticles: pages.CountPublished(language_id, "article"),
    totalMessages: pages.CountPublished(language_id, "message"),
    totalProjects: pages.CountPublished(language_id, "project"),
    totalEvents: pages.CountPublished(language_id, "event"),
    topics: tags.ListById(tag_ids)
  };
  return json(await promiseHash(hash));
};

export const action = async ({ request, params, context }) => {
  return redirect(request.url);
};

const Post = (p, locale, t) => {
  return (
    <div key={p.id} id={`page-${p.id}`} className="relative border-b mt-2.5">
      {p.isSticky &&
        <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="yellow" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="absolute top-0 left-0">
          <line x1="12" x2="12" y1="17" y2="22"></line>
          <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
        </svg>}
      <h2 className="pb-5 mb-2.5 text-[#2971a7] text-center text-base font-bold">
        {
          <Link className="no-underline" to={`/posts/${p.id}`} title={p.title}>
            {p.title}
          </Link>
        }
      </h2>
      {p.subtitle && <p><strong>{p.subtitle}</strong></p>}
      {p.picture4preview && <img src={p.picture4preview} />}
      <div className="block text-right mt-2.5 mr-5 text-xs"
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

      {/*<div*/}
      {/*  dangerouslySetInnerHTML={{*/}
      {/*    __html: p.messageBody*/}
      {/*  }}*/}
      {/*/>*/}
      {p.tags.length > 0 && (
        <>
          <p className="mb-2.5 pb-5">
            {p.tags.map((tag) => (
              <Link className="whitespace-nowrap text-xs text-[#666] bg-[#ebf8ff] rounded-md relative no-underline px-2.5 py-0.5 leading-4" key={tag} to={`${locale}/tag/${tag}`}>{tag}</Link>
            ))}
          </p>
        </>
      )}
    </div>
  );
};

export default function PostsAll() {
  const { t } = useTranslation();

  const {
    locale, stream, result, buttons, links, feed,
    totalPosts, totalArticles, totalMessages, totalProjects, totalEvents, topics
  } = useLoaderData();
  const [items, setItems] = useState(result.posts);
  const [streamType, setStreamType] = useState(stream);
  const [more, setMore] = useState(result.posts.length === 10);
  const fetcher = useFetcher();

  useEffect(() => {
    setItems(() => result.posts);
  }, [locale]);

  useEffect(() => {
    if (streamType !== stream) {
      setItems(() => result.posts);
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
      <div className="grid grid-cols-12">
        <div className="col-span-2">
          <LeftNav t={t} locale={locale}
                   totalPosts={totalPosts} totalArticles={totalArticles}
                   totalMessages={totalMessages} totalProjects={totalProjects}
                   totalEvents={totalEvents}
                   topics={topics}
          />
        </div>
        <div className="col-span-7 p-2.5 border-[#dcf2ff] border-2 rounded">
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
        </div>
        <div className="col-span-3">
          <RightNav t={t} buttons={buttons} links={links} feed={feed} />
        </div>
      </div>
    </>
  );
}

const Feed = ({ t, feed }) => {
  if (feed) {
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
  }
};

const RightNav = ({ t, buttons, links, feed }) => {
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
    {/*<div>TODO: Button</div>*/}
  </>;
};

// TODO move it to DB
const Buttons = ({ buttons }) => {
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
