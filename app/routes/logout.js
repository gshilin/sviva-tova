import {authenticator} from "../services/auth.server";

/**
 *  handle the logout request
 */
export const action = async ({request}) => {
    await authenticator.logout(request, {
        redirectTo: "/login"
    });
};

export const loader = async ({request, params}) => {
    await authenticator.logout(request, {
        redirectTo: "/login"
    });
};
