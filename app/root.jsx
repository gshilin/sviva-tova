import { cssBundleHref } from "@remix-run/css-bundle";

import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import i18next from "./services/i18next.server";
import i18n from "./services/i18n";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { ExternalScripts, promiseHash } from "remix-utils";

import tailwind from "./tailwind.css";
import vjs from "./vjs.css";
import { Footer } from "./components/Footer";
import { languages } from "./services/models/languages.server";
import { useChangeLanguage } from "remix-i18next";
import { TopNav } from "./components/topnav/TopNav";
import { authenticator } from "./services/auth.server";
import { roles_users } from "./services/models/roles_users.server";
import { taggings } from "./services/models/taggings.server";
import { pages } from "./services/models/pages.server";
import { tags } from "./services/models/tags.server";
import axios from "axios";
import { parseString } from "xml2js";
import { Layout } from "./components/Layout";

export const meta = ({data}) => {
    return [
        {charset: "utf-8"},
        {title: data.title},
        {viewport: "width=device-width,initial-scale=1"},
        {
            property: "og:title",
            content: data.title
        },

        // you can now add SEO related <links>
        {tagName: "link", rel: "canonical", href: "..."}
    ];
};

export const links = () => [
    ...(cssBundleHref ? [ {rel: "stylesheet", href: cssBundleHref} ] : []),
    {rel: "stylesheet", href: tailwind},
    {rel: "stylesheet", href: vjs},
];

// TODO move it to DB
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

export const loader = async ({request, params}) => {
    const locale = params.locale || await i18next.getLocale(request);
    if (!i18n.supportedLngs.includes(locale)) {
        return redirect("/en/posts/all");
    }
    const user = await authenticator.isAuthenticated(request);
    const t = await i18next.getFixedT(request);

    let hash;
    if (user) {
        const [ language_id, tag_ids ] = await Promise.all([
            languages.GetIdByLocale(locale),
            taggings.List(locale)
        ]);

        hash = {
            userId: user?.id,
            locale,
            languages: languages.GetLanguages(),
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
    } else {
        hash = {
            locale,
            title: t("home.views.site_name"),
            languages: languages.GetLanguages(),
            userId: user?.id,
            isAdmin: roles_users.IsAdmin(user?.id)
        };
    }
    return json(await promiseHash(hash));
};

export const action = async ({request, params, context}) => {
    return redirect(request.url);
};

export default function App() {
    const {i18n, t} = useTranslation();
    const loaderData = useLoaderData();
    const {locale, languages, userId, isAdmin} = loaderData;

    useChangeLanguage(locale);

    let moreLinks = [];
    if (userId) {
        moreLinks.push({
            title: t("views.signout"),
            to: "/logout"
        });
        if (isAdmin) {
            moreLinks.push({
                title: t("home.views.admin"),
                to: `/${locale}/admin/panel`
            });
        }
    }

    return (
        <html lang={locale} dir={i18n.dir()}>
        <head>
            <Meta/>
            <Links/>
        </head>
        <body className="bg-white font-sans text-sm leading-5 text-gray-500">
        <div className="block mt-5 bg-white top-0 w-full h-fit absolute">
            <div
                className="h-52 mx-auto my-0 border border-black border-opacity-100 rounded"
                style={{width: 960}}
            >
                AD
            </div>
        </div>
        <div
            className="shadow-[0px_0px_10px_0px_#666666] mt-64 mx-auto mb-5 p-2.5 bg-white rounded relative"
            style={{width: 960, direction: i18n.dir()}}
        >
            <TopNav locale={locale} languages={languages} t={t} moreLinks={moreLinks}/>
            {userId &&
                <Layout loaderData={loaderData}/>
            }
            {!userId && <Outlet/>}
            <Footer t={t}/>
        </div>
        <ScrollRestoration/>
        <Scripts/>
        <ExternalScripts/>
        <LiveReload/>
        </body>
        </html>
    );
}
