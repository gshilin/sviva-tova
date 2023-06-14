import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { languages } from "./languages.server";

export const articleResources = pgTable("article_resources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  body: text("body"),

  languageId: integer("language_id").references(() => languages.id)
});
