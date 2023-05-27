import { boolean, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { and, desc, eq, inArray, notInArray, sql } from "drizzle-orm";

import { db } from "../db.server";
import { languages } from "./languages.server";
import { users } from "./users.server";
import { taggings } from "./taggings.server";
import { tags } from "./tags.server";

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  messageBody: text("message_body"),
  status: varchar("status", { length: 255 }),
  isSticky: boolean("is_sticky"),
  pageType: varchar("page_type", { length: 255 }),
  picture4preview: varchar("picture4preview", { length: 255 }),
  // TODO stream_preset_id: DataTypes.INTEGER,
  subtitle: varchar("subtitle", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  publishAt: timestamp("publish_at", { withTimezone: true }),

  languageId: integer("language_id").references(() => languages.id),
  authorId: integer("author_id").references(() => users.id)
});

pages.CountPublished = async (languageId, pageType = undefined) => {
  let eqs = [
    eq(pages.languageId, languageId),
    eq(pages.status, "PUBLISHED")
  ];
  if (pageType) {
    eqs.push(eq(pages.pageType, pageType));
  }
  const result = await db.select({
    total: sql`count(1)`
  }).from(pages).where(and(...eqs));

  return result[0].total;
};

pages.List = async ({ locale, pageNo, streamTypes, withTags }) => {
  const languageId = await languages.GetIdByLocale(locale);

  let eqs = [
    eq(pages.languageId, languageId),
    eq(pages.status, "PUBLISHED")
  ];
  if (streamTypes) {
    eqs.push(inArray(pages.pageType, streamTypes));
  }
  const posts = await db.select().from(pages)
    .where(and(...eqs))
    .orderBy(desc(sql`${pages.isSticky} is true`), desc(pages.updatedAt))
    .offset(pageNo * 10).limit(10)
  ;
  if (withTags) {
    for (const post of posts) {
      const tags = await pages.ListTags(post.id);
      post.tags = tags.map(t => t.name);
    }
  }
  return {
    page: pageNo,
    posts,
    locale
  };
};


pages.ListTags = async (pageId) =>
  await db.select({
    name: tags.name
  }).from(tags)
    .where(notInArray(tags.name, [
      "webrtc",
      "webrtc4"
    ]))
    .innerJoin(taggings, and(eq(taggings.taggableId, pageId), eq(tags.id, taggings.tagId)));
