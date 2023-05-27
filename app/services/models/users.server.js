import { boolean, integer, json, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";

import { db } from "../db.server";
import { languages } from "./languages.server";
import { countries } from "./countries.server";
import { regions } from "./regions.server";
import { locations } from "./locations.server";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  encryptedPassword: varchar("encrypted_password", { length: 255 }).notNull(),
  passwordSalt: varchar("password_salt", { length: 255 }).notNull(),
  confirmationToken: varchar("confirmation_token", { length: 255 }),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  confirmationSentAt: timestamp("confirmation_sent_at", { withTimezone: true }),
  resetPasswordToken: varchar("reset_password_token", { length: 255 }),
  rememberToken: varchar("remember_token", { length: 255 }),
  rememberCreatedAt: timestamp("remember_created_at", { withTimezone: true }),
  signInCount: integer("sign_in_count").default(0),
  currentSignInAt: timestamp("current_sign_in_at", { withTimezone: true }),
  lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }),
  currentSignInIp: varchar("current_sign_in_ip", { length: 255 }),
  lastSignInIp: varchar("last_sign_in_ip", { length: 255 }),
  failedAttempts: integer("failed_attempts").default(0),
  unlockToken: varchar("unlock_token", { length: 255 }),
  locked_at: timestamp("locked_at", { withTimezone: true }),
  gender: varchar("gender", { length: 255 }),
  birthday: varchar("birthday", { length: 255 }),
  notifybyemail: varchar("notifybyemail", { length: 255 }),
  state: varchar("state", { length: 255 }).notNull().default("idle"),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  // TODO userListId: integer(''), // Reference?
  avatarFileName: varchar("avatar_file_name", { length: 255 }),
  avatarContentType: varchar("avatar_content_type", { length: 255 }),
  avatarFileSize: integer("avatar_file_size"),
  avatarUpdatedAt: timestamp("avatar_updated_at", { withTimezone: true }),
  buttonClickSet: integer("button_click_set"),
  authenticationToken: varchar("authentication_token", { length: 255 }),
  resetPasswordSentAt: timestamp("reset_password_sent_at", { withTimezone: true }),
  sn_provider: varchar("sn_provider", { length: 255 }),
  sn_id: varchar("sn_id", { length: 255 }),
  sn_data: json("sn_data"),
  ad_was_shown: boolean("ad_was_shown").notNull().default(false),
  ad_2w_was_shown: integer("ad_2w_was_shown"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),

  languageId: integer("language_id").references(() => languages.id),
  countryId: integer("country_id").references(() => countries.id),
  regionId: integer("region_id").references(() => regions.id),
  locationId: integer("location_id").references(() => locations.id)
});

users.FindUnique = async (id) => {
  return await db.from(users).where({ id });
};

users.FindByEmail = async (email) => {
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user?.[0] ?? {};
};

users.Update = async (user, params) => {
  let updatedUser;
  try {
    updatedUser = await db.update(users)
      .set(params)
      .where(eq(users.email, user.email))
      .returning();
  } catch (e) {
    console.error("ERROR", e);
  }
  return updatedUser;
};
