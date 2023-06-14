import { boolean, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { and, desc, eq, inArray, notInArray, sql } from "drizzle-orm";

import { db } from "../db.server";
import { languages } from "./languages.server";
import { users } from "./users.server";
import { taggings } from "./taggings.server";
import { tags } from "./tags.server";
import { assets } from "./assets.server";
import { articleResources } from "./article_resources.server";
import { audioResources } from "./audio_resources.server";
import { videoResources } from "./video_resources.server";
import { promiseHash } from "remix-utils";

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

pages.Get = async ({ pageId }) => {
  const pgs = await db
    .select()
    .from(pages)
    .where(eq(pages.id, pageId));
  if (pgs.length === 0) {
    return null;
  }
  const page = pgs[0];
  const tags = await pages.ListTags(page.id, false);
  page.tags = tags.map(t => t.name);
  page.assets = await db
    .select()
    .from(assets)
    .where(eq(assets.pageId, page.id));
  for (const asset of page.assets) {
    const { articles, audios, videos } = await promiseHash({
      articles: db
        .select()
        .from(articleResources)
        .where(eq(asset.resourceId, articleResources.id)),
      audios: db
        .select()
        .from(audioResources)
        .where(eq(asset.resourceId, audioResources.id)),
      videos: db
        .select()
        .from(videoResources)
        .where(eq(asset.resourceId, videoResources.id))
    });
    asset.articles = articles;
    asset.audios = audios;
    asset.videos = videos;
  }
  return page;
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
  let sticky = [];
  if (pageNo === 0) {
    sticky = await db.select().from(pages)
      .where(and(...eqs, eq(pages.isSticky, true)))
      .orderBy(desc(pages.updatedAt))
      .offset(0).limit(1)
    ;
  }
  let posts;
  let limit = 10;
  if (sticky.length > 0) {
    limit -= sticky.length;
  }
  if (limit > 0) {
    posts = await db.select().from(pages)
      .where(and(...eqs, eq(pages.isSticky, false)))
      .orderBy(desc(pages.updatedAt))
      .offset(pageNo * 10).limit(limit)
    ;
  }
  if (withTags) {
    for (const post of sticky) {
      const tags = await pages.ListTags(post.id);
      post.tags = tags.map(t => t.name);
    }
    for (const post of posts) {
      const tags = await pages.ListTags(post.id);
      post.tags = tags.map(t => t.name);
    }
  }
  return {
    page: pageNo,
    sticky,
    posts,
    locale
  };
};


pages.ListTags = async (pageId, filtered = true) => {
  let sql = db.select({
    name: tags.name
  }).from(tags);
  if (filtered) {
    sql = sql.where(notInArray(tags.name, [
      "webrtc",
      "webrtc4"
    ]));
  }
  return sql.innerJoin(taggings, and(eq(taggings.taggableId, pageId), eq(tags.id, taggings.tagId)));
};
