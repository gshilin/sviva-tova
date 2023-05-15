import {Form, useLoaderData} from "@remix-run/react";

import {authenticator} from "../services/auth.server";

/**
 * check the user to see if there is an active session, if not
 * redirect to login page
 *
 */
export const loader = async ({request}) => {
    return await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
};

/**
 *  handle the logout request
 *
 */
export const action = async ({request}) => {
    await authenticator.logout(request, {redirectTo: "/login"});
};

export default function IndexPage() {
    const data = useLoaderData();
    return (
        <div style={{fontFamily: "system-ui, sans-serif", lineHeight: "1.4"}}>
            <h1>Welcome to Remix Protected Dashboard</h1>
            <p>{data?.name} {data?.token}</p>
            <Form method="post">
                <button>Log Out</button>
            </Form>
        </div>
    );
}
