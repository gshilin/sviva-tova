import { createCookieSessionStorage } from 'remix';

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set");
}

// export the whole sessionStorage object
export let sessionStorage = createCookieSessionStorage({
    cookie: {
        name: 'arvut_session', // use any name you want here
        secure: process.env.NODE_ENV === 'production', // enable this in prod only
        secrets: [sessionSecret], // replace this with an actual secret
        sameSite: 'lax', // this helps with CSRF
        path: '/', // remember to add this so the cookie will work in all routes
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true, // for security reasons, make this cookie http only
    },
});