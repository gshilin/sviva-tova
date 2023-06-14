import { boolean, integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { languages } from "./languages.server";

export const audioResources = pgTable("audio_resources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  description: text("description"),
  embed: text("embed"),
  url: varchar("url", { length: 255 }),
  isAutoplay: boolean("is_autoplay"),
  isVisible: boolean("is_visible"),

  languageId: integer("language_id").references(() => languages.id)
});
