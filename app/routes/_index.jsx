import {authenticator} from "../services/auth.server";

/**
 * check the user to see if there is an active session, if not
 * redirect to login page
 *
 */
export const loader = async ({ request, params }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
    successRedirect: "/en/posts/all",
  });

  return { user };
};
