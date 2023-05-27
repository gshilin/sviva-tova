import { integer, pgTable } from "drizzle-orm/pg-core";
import { users } from "./users.server";
import { roles } from "./roles.server";
import { db } from "../db.server";
import { eq } from "drizzle-orm";

export const roles_users = pgTable("roles_users", {
  role_id: integer("role_id").notNull().references(() => roles.id),
  user_id: integer("user_id").notNull().references(() => users.id)
});

roles_users.GetRoles = async (userId) => db
  .select({
    role: roles.role
  })
  .from(roles_users)
  .leftJoin(roles, eq(roles_users.role_id, roles.id))
  .where(eq(roles_users.user_id, userId));

roles_users.IsAdmin = async (userId) => {
  const rolesMap = new Map(
    (await roles_users.GetRoles(userId)).map(role => [role.role, 1])
  );

  return rolesMap.has("Admin")
    || rolesMap.has("super_moderator")
    || rolesMap.has("Moderator")
    || rolesMap.has("Reports")
    || rolesMap.has("Groupmanager")
    || rolesMap.has("Super")
    || rolesMap.has("Stream_Manager")
    || rolesMap.has("Translator");
};
