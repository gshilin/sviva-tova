import {Form, useLoaderData} from "@remix-run/react";

import {authenticator} from "../services/auth.server";

/**
 * check the user to see if there is an active session, if not
 * redirect to login page
 *
 */
export const loader = async ({request, params}) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });

    return {user};
};

export default function Index() {
    const { user} = useLoaderData();
    console.log("=============> loader USER 1", user);
    return (
        <div style={{fontFamily: "system-ui, sans-serif", lineHeight: "1.4"}}>
            <h1>Welcome to Remix Protected Dashboard</h1>
            <p>{user?.firstName} {user?.lastName}</p>
            <Form action="/logout" method="post">
                <button>Log Out</button>
            </Form>
        </div>
    );
}
