import {authenticator} from "../services/auth.server";

export let loader = ({request, params}) => {
    return authenticator.authenticate(params.provider, request, {
        successRedirect: "/en/posts/all",
        failureRedirect: '/login',
    });
};