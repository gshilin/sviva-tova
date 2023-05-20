import {integer, pgTable, serial, timestamp, varchar} from "drizzle-orm/pg-core";
import {tags} from "./tags.server";
import {pages} from "./pages.server";
import {db} from "../db.server";
import {and, eq} from "drizzle-orm/expressions";
import {sql} from 'drizzle-orm/sql';

export const taggings = pgTable('taggings', {
    id: serial('id').primaryKey(),
    context: varchar('context', {length: 255}),

    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),

    tagId: integer('tag_id').references(() => tags.id),
    taggableId: integer('taggable_id').references(() => pages.id),
});

taggings.List = async (locale) =>
    db
        .select({
            tag_id: sql`DISTINCT ${taggings.tagId}`,
        }).from(taggings)
        .where(and(eq(taggings.context, locale + '_tags'), eq(pages.status, 'PUBLISHED')))
        .innerJoin(pages, eq(pages.id, taggings.taggableId));