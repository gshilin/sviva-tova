import {redirect} from "@remix-run/server-runtime";
import {authenticator} from "../services/auth.server";

export const loader = () => redirect('/login');

export const action = ({ request, params }) => {
    return authenticator.authenticate(params.provider, request);
};
