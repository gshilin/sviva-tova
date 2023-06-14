import { boolean, integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { languages } from "./languages.server";

export const videoResources = pgTable("video_resources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  description: text("description"),
  image: varchar("image", { length: 255 }),
  embed: text("embed"),
  url: varchar("url", { length: 255 }),
  isAutoplay: boolean("is_autoplay"),

  languageId: integer("language_id").references(() => languages.id)
});
