// Create an instance of the authenticator,
// with what strategies will return and will store in the session
import {Authenticator, AuthorizationError} from "remix-auth";
import {FormStrategy} from 'remix-auth-form';

import {sessionStorage} from '~/services/session.server';
import {users} from "./models/users.server";
import {FacebookStrategy, SocialsProvider} from "remix-auth-socials";
import {KeycloakStrategy} from "remix-auth-keycloak";

export const authenticator = new Authenticator(sessionStorage, {
    sessionKey: "sessionKey", // keep in sync
    sessionErrorKey: "sessionErrorKey", // keep in sync
});

const getCallback = (provider) => {
    return `http://localhost:3000/auth/${provider}/callback`
}

// Tell the Authenticator to use the form strategy
authenticator.use(
    new FormStrategy(async ({form}) => {

        // get the data from the form...
        let email = form.get('email');
        let password = form.get('password');

        // do some validation, errors are in the sessionErrorKey
        if (!email || email?.length === 0) throw new AuthorizationError('Bad Credentials: Email is required')
        if (typeof email !== 'string')
            throw new AuthorizationError('Bad Credentials: Email must be a string')

        if (!password || password?.length === 0) throw new AuthorizationError('Bad Credentials: Password is required')
        if (typeof password !== 'string')
            throw new AuthorizationError('Bad Credentials: Password must be a string')

        // login the user
        const user = await users.FindByEmail(email);
        if (!user) throw new AuthorizationError("Bad Credentials");
        const isCorrectPassword = await comparePassword(password, user.passwordSalt, user.encryptedPassword);
        if (!isCorrectPassword) throw new AuthorizationError("Bad Credentials");
        const userData = {id: user.id, email};

        return Promise.resolve({...userData});
    }),
).use(
    new FacebookStrategy({
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_SECRET_KEY,
            callbackURL: getCallback(SocialsProvider.FACEBOOK),
        },
        async ({profile}) => {
            // find a user in our DB
            const user = await users.FindByEmail(profile._json.email);
            if (!user) throw new AuthorizationError("Bad Credentials");
            await users.Update(user, {
                sn_provider: profile.provider,
                sn_id: profile.id,
                sn_data: profile,
            })
            const userData = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            };

            return Promise.resolve({...userData});
        }
    )
).use(
    new KeycloakStrategy({
            useSSL: true,
            domain: process.env.KEYCLOAK_DOMAIN,
            realm: process.env.KEYCLOAK_REALM,
            clientID: process.env.KEYCLOAK_CLIENT_ID,
            clientSecret: process.env.KEYCLOAK_SECRET,
            callbackURL: getCallback("keycloak"),
        },
        async ({accessToken, refreshToken, extraParams, profile}) => {
            console.log("Keycloak SUCCESS");
            console.log(accessToken, refreshToken);
            console.table(profile);
            console.table(extraParams);
            // Get the user data from your DB or API using the tokens and profile
            return User.findOrCreate({email: profile.emails[0].value});
        }
    )
);

const comparePassword = async (plaintext, salt, hash) => {
    const pepper = process.env.SESSION_SECRET;
    if (pepper === "") {
        return false;
    }
    // const hash = bcrypt.hashSync(password, salt)
    // const stretches = 10;
    // secure_compare(hash, digest(plaintext, stretches, salt, pepper))

//     const passwordHash = Buffer.from(hash, 'base64');
//     console.log("PHASH : ", passwordHash);
// // encrypted_password = Devise::Encryptors::Sha1.digest(password, Devise.stretches, user.password_salt, Devise.pepper)
//     const encrypted_password = digestSha1(plaintext, stretches, salt, pepper);
//     console.log("DIGEST: ", encrypted_password);
//     console.log("HASH  : ", hash);
//     const saltX = await bcrypt.genSalt(stretches);
//     console.log("SALTX : ", saltX);
//     const saltFull = `$2a$${stretches}$${salt}`
//     console.log("SALT  : ", saltFull);
//     try {
//         const x = await bcrypt.hash(plaintext, saltX);
//         console.log("X     : ", x);
//     } catch (e) {
//         console.log("ERROR", e)
//     }
//     try {
//         const res = await bcrypt.compare(plaintext+pepper, saltFull + hash);
//         console.log("RES   ", res)
//         return res;
//     } catch (e) {
//         console.log("ERROR", e)
//     }
//     const encrypted = bcrypt.hashSync(plaintext, saltFull);
//     console.log(encrypted, hash);
//     const encrypted = `$2a$${stretches}$${salt}${hash}`;
//     const password = `${plaintext}${pepper}`
//     return bcrypt.compareSync(password, encrypted);
    return false;
}

function digestSha1(password, stretches, salt, pepper) {
    let digest = pepper;
    for (let i = 0; i < stretches; i++) {
        digest = secureDigest(salt, digest, password, pepper);
    }
    return digest;
}

function secureDigest(salt, digest, password, pepper) {
    const token = `--${salt}--${digest}--${password}--${pepper}--`;
    const sha1 = crypto.createHash('sha1').update(token, 'binary').digest('hex');
    return sha1;
}