import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { and, inArray, notInArray } from "drizzle-orm";

import { db } from "../db.server";

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 })
});

tags.ListById = (tag_ids) => {
  const ids = tag_ids.map(t => t.tag_id);
  return db.select({
    id: tags.id,
    name: tags.name
  }).from(tags).where(and(inArray(tags.id, ids), notInArray(tags.name, [
    "webrtc",
    "webrtc4"
  ])));
};
