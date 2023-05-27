// Create an instance of the authenticator,
// with what strategies will return and will store in the session
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";

import { sessionStorage } from "~/services/session.server";
import { users } from "./models/users.server";
import { FacebookStrategy, SocialsProvider } from "remix-auth-socials";
import { KeycloakStrategy } from "remix-auth-keycloak";

export const authenticator = new Authenticator(sessionStorage, {
  sessionKey: "sessionKey", // keep in sync
  sessionErrorKey: "sessionErrorKey" // keep in sync
});

const getCallback = (provider) => {
  return `http://localhost:3000/auth/${provider}/callback`;
};

const facebookStrategyOptions = {
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_SECRET_KEY,
  callbackURL: getCallback(SocialsProvider.FACEBOOK)
};

const facebookStrategyVerify = async ({ profile }) => {
  // find a user in our DB
  const user = await users.FindByEmail(profile._json.email);
  if (!user) throw new AuthorizationError("Bad Credentials");
  users.Update(user, {
    sn_provider: profile.provider,
    sn_id: profile.id,
    sn_data: profile
  });
  const userData = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  };
  return Promise.resolve({ ...userData });
};

const keycloakStrategyOptions = {
  useSSL: true,
  domain: process.env.KEYCLOAK_DOMAIN,
  realm: process.env.KEYCLOAK_REALM,
  clientID: process.env.KEYCLOAK_CLIENT_ID,
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
  callbackURL: getCallback("keycloak")
};

const keycloakStrategyVerify = async ({
                                        accessToken,
                                        refreshToken,
                                        extraParams,
                                        profile
                                      }) => {
  // find a user in our DB
  const user = await users.FindByEmail(profile._json.email);
  if (user) {
    users.Update(user, {
      sn_provider: profile.provider,
      sn_id: profile.id,
      sn_data: profile
    });
  } else {
    // We believe keycloak, so let's create this user
    // TODO: create a user
  }
  // TODO: What to do with tokens?
  // console.log(accessToken, refreshToken);
  const userData = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  };
  return Promise.resolve({ ...userData });
};

const formStrategyVerify = async ({ form }) => {
  // get the data from the form...
  let email = form.get("email");
  let password = form.get("password");

  // do some validation, errors are in the sessionErrorKey
  if (!email || email?.length === 0)
    throw new AuthorizationError("Bad Credentials: Email is required");
  if (typeof email !== "string")
    throw new AuthorizationError("Bad Credentials: Email must be a string");

  if (!password || password?.length === 0)
    throw new AuthorizationError("Bad Credentials: Password is required");
  if (typeof password !== "string")
    throw new AuthorizationError("Bad Credentials: Password must be a string");

  // login the user
  const user = await users.FindByEmail(email);
  if (!user) throw new AuthorizationError("Bad Credentials");
  const isCorrectPassword = await comparePassword(
    password,
    user.passwordSalt,
    user.encryptedPassword
  );
  if (!isCorrectPassword) throw new AuthorizationError("Bad Credentials");
  const userData = { id: user.id, email };

  return Promise.resolve({ ...userData });
};

// Tell the Authenticator to use the form strategy
authenticator
  .use(new FormStrategy(formStrategyVerify))
  .use(new FacebookStrategy(facebookStrategyOptions, facebookStrategyVerify))
  .use(new KeycloakStrategy(keycloakStrategyOptions, keycloakStrategyVerify));

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
};

const digestSha1 = (password, stretches, salt, pepper) => {
  let digest = pepper;
  for (let i = 0; i < stretches; i++) {
    digest = secureDigest(salt, digest, password, pepper);
  }
  return digest;
};

const secureDigest = (salt, digest, password, pepper) => {
  const token = `--${salt}--${digest}--${password}--${pepper}--`;
  return crypto.createHash("sha1").update(token, "binary").digest("hex");
};
