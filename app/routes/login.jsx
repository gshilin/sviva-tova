import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { SocialsProvider } from "remix-auth-socials";

import { authenticator } from "../services/auth.server";
import { sessionStorage } from "~/services/session.server";

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-purple-900 outline-purple-300 `;

/**
 * get the cookie and see if there are any errors that were generated when attempting to log in
 */
export const loader = async ({ request, params }) => {
  const locale = params.locale || "en";

  await authenticator.isAuthenticated(request, {
    successRedirect: `/${locale}/posts/all`
  });

  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const error = session.get("sessionErrorKey");
  const hash = {
    error,
    locale
  };
  return json(hash);
};

/**
 * called when the user hits button to log in
 *
 */
export const action = async ({ request, context }) => {
  // call my authenticator
  return authenticator.authenticate("form", request, {
    successRedirect: "/en/posts/all",
    throwOnError: true,
    context
  });
};

const loginText = {
  en: `
    <h2>Welcome to the "Sviva Tova" (Good Environment)!</h2>
    <p>
      “Sviva Tova” is the worldwide network of the Bnei Baruch Kabbalah
      Education &amp; Research Institute -  
      <a href="https://www.kabbalah.info/">https://www.kabbalah.info</a> -
      that connects between points in the heart, and brings them a
      step-by-step external-corporeal connection to the inner connection of
      bestowal. “Sviva Tova” is an order of Kabbalists in our generation for
      the building of a new society, based on connections of love and
      bestowal, as the single solution for all of humanity’s problems.
    </p>
    <p>
      The website “Sviva Tova” connects you to the daily spiritual stream,
      updates you in real-time on all events of the worldwide Bnei Baruch
      Kabbalah Education &amp; Research Institute, and allows you to stay
      connected with the World Kli at any time of the day.
    </p>
    <h3>“Sviva Tova”…</h3>
    <ul>
      <li>Returns you to the spiritual life</li>
      <li>Connects you to the natural, spiritual mechanism</li>
      <li>Leads you to a connection of never-ending love</li>
      <li>Speeds up the changes of your perception of reality</li>
      <li>Allows you to realize your free choice</li>
      <li>Expresses your mutual guarantee (Arvut) to society</li>
    </ul>`,
  es: `
    <h2>Bienvenido al “Sviva Tova” (Buen Entorno)</h2>
    <p>“Sviva Tova” es la red mundial que nos conecta entre los puntos del corazón, y los lleva paso a paso de una conexión corpórea externa a la conexión interna del otorgamiento. “Sviva Tova” es una orden de cabalistas en nuestra generación para la construcción de una nueva sociedad, basada en la conexión del amor y el otorgamiento, como la única solución para todos los problemas de la humanidad.</p>
    <p>El sitio web “Sviva Tova” lo conecta con la cobertura espiritual mundial diaria, actualiza en tiempo real todos los eventos mundiales del Instituto Bnei Baruch para el Estudio y la Investigación de la Cabalá, y le permite estar conectado con el kli mundial a cualquier hora del día.</p>
    <h3>“Sviva Tova”</h3>
    <ul> 
      <li>Lo regresa a la vida spiritual</li>
      <li>Lo conecta con lo natural y los mecanismos espirituales</li>
      <li>Lo lleva a una conexión de amor sin fin</li>
      <li>Acelera los cambios de su percepción de la realidad</li>
      <li>Le permite descubrir su libertad de elección</li>
      <li>Expresa su garantía mutua (Arvut) hacia la sociedad</li>
      <li>Usted necesita firmar o registrarse antes de continuar</li>
    </ul>`,
  he: `
    <h2>ברוכים הבאים לסביבה טובה</h2>
    <p>"סביבה טובה" היא רשת עולמית הקושרת את הנקודות שבלב, ומביאה אותם בהדרגתיות מקשר חיצוני-גשמי לקשר פנימי של השפעה. "סביבה טובה" היא ציווי המקובלים בדורנו לבניית חברה חדשה, המבוססת על קשרי השפעה ואהבה, כפתרון היחיד לכל בעיות האנושות.</p>
    <p>האתר "סביבה טובה" מחבר אתכם לזרימה הרוחנית היומית, מעדכן אתכם בזמן אמת על כל אירועי "קבלה לעם" העולמיים, ומאפשר לכם לשמור על קשר עם הכלי העולמי בכל שעות היממה.</p>
    <h3>"סביבה טובה"...</h3>
    <ul> 
      <li>מחזירה אותך לחיים רוחניים</li>
      <li>מחברת אותך למנגנון הטבע הרוחני</li>
      <li>מובילה אותך לקשר של אהבה נצחית</li>
      <li>מזרזת את שינוי תפיסת המציאות שלך</li>
      <li>מממשת את הבחירה החופשית שלך</li>
      <li>מבטאת את הערבות שלך כלפי החברה</li>
    </ul>`,
  pt: `
    <h2>Seja bem vindo ao "Sviva Tova" (Bom ambiente)!</h2>
    <p>“Sviva Tova” é a rede mundial que conecta os pontos no coração, e os traz passo a passo , de uma conexão externa e corpórea para uma interna conexão de doação. “Sviva Tova” é uma ordem de Cabalistas em nossa geração para a construção de uma nova sociedade, baseada na conexão de amor e doação, como a única solução para todos os problemas da humanidade.</p>
    <p>O Website “Sviva Tova” conecta você a corrente espiritual diária, atualiza em tempo real todos os eventos mundiais do Instituto Bnei Baruch Kabbalah de Educação & Pesquisa, e lhe permite estar conectado com o Kli Mundial a qualquer hora do dia.</p>
    <h3>“Sviva Tova”…</h3>
    <ul> 
      <li>Te traz de volta a vida espiritual</li>
      <li>Conecta você ao natural e ao mecanismo espiritual</li>
      <li>Te lidera a uma conxão de amor sem fim</li>
      <li>Acelera as mudanças da sua percepção da realidade</li>
      <li>Te permite descobrir o seu livre arbítrio</li>
      <li>Expressa a sua garantia mutua (Arvut) para a sociedade</li>
    </ul>`,
  ru: `
    <h2>Добро пожаловать на сайт "Sviva Tova"!</h2>
    <p>"Sviva Tova" (хорошее окружение) - это международное сообщество, объединяющее "точки в сердце" и призванное помочь человеку постепенно перейти от внешней, материальной связи между нами к связи внутренней - любви и отдаче.</p>
    <p>"Sviva Tova" - это реализация указания каббалистов нашему поколению - построить новое общество, основанное на отдаче и любви, как единственное решение всех проблем человечества.</p>
    <p>"Sviva Tova" поможет тебе включиться в ежедневно обновляющийся духовный поток, сообщит обо всех событиях, происходящих в наших центрах по всему миру, позволяя находиться в постоянной связи со всей Мировой группой.</p>
    <p>Только правильное окружение способно вернуть тебя к духовной жизни и, подключив к системе духовной природы, продвинуть к состоянию вечной любви, ускорив переход к неискажённому восприятию реальности. Только пример товарищей помогает реализовать свободный выбор и выражает отношения поручительства в нашем сообществе. Вливайся и ощути себя в одной большой, дружной семье, где всегда можно найти помощь и поддержку в любой жизненной ситуации, где нет частных проблем - потому, что мы решаем их вместе.</p>`,
  tr: `
    <h2>"Sviva Tova"ya (İyi Çevre'ye) Hoşgeldiniz !</h2>
    <p>"Sviva Tova" kalpteki noktalarımızı birleştiren ve bizleri adım adım dış maddesel bağımızdan iç manevi bağımıza yönelten, ihsan etmeye yaklaştıran uluslararası bir ağ topluluğudur. Sviva Tova, Kabalistler tarafından neslimizde kurulması emredilen, sevgi ve ihsan etme ile kurulacak bağları temel alan yeni bir topluluk, yani tüm insanlığın bütün sorunlarına tek çözüm olacak bir birlik olgusudur.</p>
    <p>"Sviva Tova" web sitesi sizi güncel manevi akıma bağlar, uluslararası Bney Baruh Kabala Eğitim ve Araştırma Merkezi'ne bağlı olan güncel tüm etkinliklerden haberdar olmanızı ve Dünya Kli'si (Kap) ile gün içerisinde istediğiniz anda bağlanabilmenizi, etkileşim içinde olmanızı sağlar.</p>
    <h3>"Sviva Tova"</h3>
    <ul>
      <li>Sizi manevi yaşama geri getirir</li>
      <li>Sizi doğal, manevi mekanizmaya bağlar</li>
      <li>Size hiç bitmeyen bir sevgi bağına doğru rehberlik eder</li>
      <li>Gerçekleri algılamanızdaki değişimi hızlandırır</li>
      <li>Özgür seçiminiz hakkındaki farkındalığınızı ortaya çıkarır</li>
      <li>Toplum ile olan karşılıklı bağınızı (Arvut) ifade eder</li>
    </ul>`
};

const LeftSide = ({ locale }) => (
  <div className="login">
    <div
      dangerouslySetInnerHTML={{
        __html: loginText[locale] || loginText["en"]
      }}
    />
  </div>
);

const FacebookButton = () => (
  <button
    className="flex items-center justify-center w-[188px] px-4 py-2 mt-2 space-x-3 text-sm text-center bg-blue-500 text-white transition-colors duration-200 transform border rounded-lg dark:text-gray-300 dark:border-gray-300 hover:bg-gray-600 dark:hover:bg-gray-700">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="currentColor"
      className="bi bi-facebook rounded-2xl"
      viewBox="0 0 16 16"
    >
      <path
        d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
    </svg>
    <span className="text-sm text-white dark:text-gray-200">Facebook</span>
  </button>
);

const KeycloakButton = () => (
  <button className="mt-2">
    <img src="/images/keycloak.png" alt="keycloak" className="rounded-lg" />
  </button>
);

const SocialButton = ({ provider }) => (
  <Form action={`/auth/${provider}`} method="post">
    {provider === SocialsProvider.FACEBOOK && <FacebookButton />}
    {provider === "keycloak" && <KeycloakButton />}
  </Form>
);

export default function Login() {
  // if I got an error it will come back with the loader data
  const loaderData = useLoaderData();
  const { locale } = loaderData;

  return (
    <>
      <div className="container flex gap-2.5">
        <div className="left-column grow-[2]">
          <LeftSide locale={locale} />
        </div>
        <div className="right-column grow-[1]">
          <div className="mb-5 rounded relative p-1 border border-opacity-100 border-[#dcf2ff]">
            <div className="relative px-8 py-5 bg-[#dcf2ff]">
              <SocialButton provider={SocialsProvider.FACEBOOK} />
              <SocialButton provider={"keycloak"} />
            </div>
          </div>
          <div className="mb-5 rounded relative p-1 border border-opacity-100 border-[#dcf2ff]">
            <div className="relative px-8 py-5 bg-[#dcf2ff]">
              <Form method="post">
                <h1 className="text-center">Login by Email (Doesn't work)</h1>
                <label className="leading-7">
                  Email:
                  <input
                    type="email"
                    className={inputClassName}
                    name="email"
                    required
                    placeholder="email"
                    autoComplete="email"
                  />
                </label>
                <label className="leading-7">
                  Password:
                  <input
                    type="password"
                    name="password"
                    placeholder="password"
                    autoComplete="current-password"
                  />
                </label>
                <button
                  className="my-4 py-2 px-7 text-purple-500 font-bold border-2 hover:scale-105 border-purple-500 rounded-lg bg-white"
                  type="submit"
                >
                  Login
                </button>
              </Form>
              <div>
                {loaderData?.error ? (
                  <p>ERROR: {loaderData?.error?.message}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
