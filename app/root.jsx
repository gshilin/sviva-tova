import {cssBundleHref} from "@remix-run/css-bundle";

import {Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration,} from "@remix-run/react";
import {useTranslation} from "react-i18next";

import styles from "~/styles/app.css"

export const meta = ({data}) => ({
    charset: 'utf-8',
    title: data.title,
    viewport: 'width=device-width,initial-scale=1',
});

export const links = () => [
    ...(cssBundleHref ? [{rel: "stylesheet", href: cssBundleHref}] : []),
    {rel: "stylesheet", href: styles},

];

export default function App() {
    const locale = 'en';
    const {i18n} = useTranslation();

    return (
        <html lang={locale} dir={i18n.dir()}>
        <head>
            <Meta/>
            <Links/>
        </head>
        <body className="bg-white font-sans text-sm leading-5 text-gray-500">
        <div className="block mt-5 bg-white top-0 w-full h-fit absolute">
            <div className="h-52 mx-auto my-0 border border-black border-opacity-100 rounded" style={{width: 960}}>
                AD
            </div>
        </div>
        <div className="shadow-[0px_0px_10px_0px_#666666] mt-64 mx-auto mb-5 p-2.5 bg-white rounded relative"
             style={{width: 960, direction: i18n.dir()}}>
            <Outlet/>
        </div>
        <ScrollRestoration/>
        <Scripts/>
        <LiveReload/>
        </body>
        </html>
    );
}
