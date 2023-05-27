import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  role: varchar("role", { length: 255 })
});
