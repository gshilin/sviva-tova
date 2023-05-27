import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";

import { countries } from "./countries.server";

export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  region: varchar("region", { length: 255 }),
  name: varchar("name", { length: 255 }),

  countryId: integer("country_id").references(() => countries.id)
});
