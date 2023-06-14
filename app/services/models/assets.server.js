import { boolean, integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { pages } from "./pages.server";
import { articleResources } from "./article_resources.server";

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  previewShow: boolean("preview_show"),
  position: integer("position"),
  resourceType: varchar("resource_type", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),

  resourceId: integer("resource_id").references(() => articleResources.id),
  pageId: integer("page_id").references(() => pages.id)
});
