import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  country: varchar("country", { length: 255 }),
  name: varchar("name", { length: 255 })
});
