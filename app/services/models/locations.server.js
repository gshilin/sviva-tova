import { doublePrecision, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { countries } from "./countries.server";
import { regions } from "./regions.server";

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  city: varchar("city", { length: 255 }),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),

  countryId: integer("country_id").references(() => countries.id),
  regionId: integer("region_id").references(() => regions.id)
});
