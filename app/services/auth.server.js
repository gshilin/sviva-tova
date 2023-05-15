// Create an instance of the authenticator,
// with what strategies will return and will store in the session
import {Authenticator, AuthorizationError} from "remix-auth";
import {FormStrategy} from 'remix-auth-form';

import {sessionStorage} from '~/services/session.server';

export const authenticator = new Authenticator(sessionStorage, {
    sessionKey: "sessionKey", // keep in sync
    sessionErrorKey: "sessionErrorKey", // keep in sync
});

// Tell the Authenticator to use the form strategy
authenticator.use(
    new FormStrategy(async ({form}) => {

        // get the data from the form...
        let email = form.get('email');
        let password = form.get('password');

        // initialize the user here
        let user = null;

        // do some validation, errors are in the sessionErrorKey
        if (!email || email?.length === 0) throw new AuthorizationError('Bad Credentials: Email is required')
        if (typeof email !== 'string')
            throw new AuthorizationError('Bad Credentials: Email must be a string')

        if (!password || password?.length === 0) throw new AuthorizationError('Bad Credentials: Password is required')
        if (typeof password !== 'string')
            throw new AuthorizationError('Bad Credentials: Password must be a string')

        // login the user, this could be whatever process you want
        if (email === 'gshilin@mail.com' && password === 'password') {
            user = {
                name: email,
                token: `${password}-${new Date().getTime()}`,
            };

            return Promise.resolve({...user});
        } else {
            // if problem with user throw error AuthorizationError
            throw new AuthorizationError("Bad Credentials")
        }
    }),
);
