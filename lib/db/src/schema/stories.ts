import { pgTable, text, serial, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const collectionsTable = pgTable("collections", {
  id: serial("id").primaryKey(),
  nameRu: text("name_ru").notNull(),
  nameEn: text("name_en").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCollectionSchema = createInsertSchema(collectionsTable).omit({ id: true, createdAt: true });
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collectionsTable.$inferSelect;

export const storiesTable = pgTable("stories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleRu: text("title_ru").notNull(),
  titleEn: text("title_en").notNull(),
  excerptRu: text("excerpt_ru").notNull(),
  excerptEn: text("excerpt_en").notNull(),
  contentRu: text("content_ru").notNull(),
  contentEn: text("content_en").notNull(),
  category: text("category").notNull(),
  collectionId: integer("collection_id").references(() => collectionsTable.id),
  isFeatured: boolean("is_featured").default(false).notNull(),
  coverImageUrl: text("cover_image_url"),
  readingTimeMinutes: integer("reading_time_minutes").default(5).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStorySchema = createInsertSchema(storiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof storiesTable.$inferSelect;

export const guestbookTable = pgTable("guestbook", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGuestbookSchema = createInsertSchema(guestbookTable).omit({ id: true, createdAt: true });
export type InsertGuestbook = z.infer<typeof insertGuestbookSchema>;
export type GuestbookEntry = typeof guestbookTable.$inferSelect;

export const authorTable = pgTable("author", {
  id: serial("id").primaryKey(),
  nameRu: text("name_ru").notNull(),
  nameEn: text("name_en").notNull(),
  bioRu: text("bio_ru").notNull(),
  bioEn: text("bio_en").notNull(),
  avatarUrl: text("avatar_url"),
  instagramUrl: text("instagram_url"),
  telegramUrl: text("telegram_url"),
});

export const insertAuthorSchema = createInsertSchema(authorTable).omit({ id: true });
export type InsertAuthor = z.infer<typeof insertAuthorSchema>;
export type Author = typeof authorTable.$inferSelect;

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
