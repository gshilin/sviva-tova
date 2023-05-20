import {pgTable, serial, timestamp, varchar} from "drizzle-orm/pg-core";
import {db} from "../db.server";
import {eq} from "drizzle-orm";

export const languages = pgTable('languages', {
    id: serial('id').primaryKey(),
    locale: varchar('locale', {length: 255}),
    language: varchar('language', {length: 255}),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
});

languages.GetIdByLocale = async (locale) => {
    if (typeof locale === 'undefined') {
        locale = 'en';
    }
    const lang = await db.select({
        id: languages.id,
    }).from(languages).where(eq(languages.locale, locale));
    if (lang.length === 0) {
        return 1;
    }
    return lang[0].id;
}

languages.GetLanguages = async () =>
    await db.select({
        value: languages.locale,
        label: languages.language,
    }).from(languages)
