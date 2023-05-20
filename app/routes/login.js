import {json} from "@remix-run/node";
import {Form, useLoaderData} from "@remix-run/react";
import {SocialsProvider} from 'remix-auth-socials';

import {authenticator} from "../services/auth.server";
import {sessionStorage} from '~/services/session.server';

/**
 * get the cookie and see if there are any errors that were
 * generated when attempting to log in
 *
 */
export const loader = async ({request}) => {

    await authenticator.isAuthenticated(request, {
        successRedirect: "/en/posts/all",
    });

    const session = await sessionStorage.getSession(
        request.headers.get("Cookie")
    );

    const error = session.get("sessionErrorKey");
    return json({error});
};

/**
 * called when the user hits button to log in
 *
 */
export const action = async ({request, context}) => {
    // call my authenticator
    const resp = await authenticator.authenticate("form", request, {
        successRedirect: "/en/posts/all",
        throwOnError: true,
        context,
    });
    console.log("resp login", resp);
    return resp;
};

const SocialButton = ({provider, label}) => (
    <Form action={`/auth/${provider}`} method="post">
        <button>{label}</button>
    </Form>
);

export default function Login() {
    // if I got an error it will come back with the loader data
    const loaderData = useLoaderData();
    console.log("loaderData", loaderData);
    return (
        <div style={{fontFamily: "system-ui, sans-serif", lineHeight: "1.4"}}>
            <h1>Welcome to Remix-Auth Example</h1>
            <p>
                Based on the Form Strategy From{" "}
                <a href="https://github.com/sergiodxa/remix-auth" target={"_window"}>
                    Remix-Auth Project
                </a>
            </p>
            <Form method="post">
                <input type="email" name="email" placeholder="email" required autoComplete="email"/>
                <input
                    type="password"
                    name="password"
                    placeholder="password"
                    autoComplete="current-password"
                />
                <button>Sign In</button>
            </Form>
            <div>
                {loaderData?.error ? <p>ERROR: {loaderData?.error?.message}</p> : null}
            </div>
            <SocialButton provider={SocialsProvider.FACEBOOK} label="Login with Facebook"/>
            <SocialButton provider={"keycloak"} label="Login with Keycloak"/>
        </div>
    );
}