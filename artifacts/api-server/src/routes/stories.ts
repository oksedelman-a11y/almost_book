import { Router } from "express";
import { db } from "@workspace/db";
import { storiesTable, collectionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "./auth";
import { CreateStoryBody, UpdateStoryBody } from "@workspace/api-zod";

const router = Router();

async function enrichStory(story: typeof storiesTable.$inferSelect) {
  let collectionName: string | null = null;
  if (story.collectionId) {
    const [col] = await db.select().from(collectionsTable).where(eq(collectionsTable.id, story.collectionId)).limit(1);
    collectionName = col?.nameEn ?? null;
  }
  return { ...story, collectionName };
}

router.get("/stories", async (req, res) => {
  const { collection } = req.query;
  let query = db.select().from(storiesTable).orderBy(desc(storiesTable.createdAt));
  const stories = await query;

  if (collection) {
    const [col] = await db.select().from(collectionsTable).where(eq(collectionsTable.slug, String(collection))).limit(1);
    if (col) {
      const filtered = stories.filter(s => s.collectionId === col.id);
      const enriched = await Promise.all(filtered.map(enrichStory));
      return res.json(enriched);
    }
  }

  const enriched = await Promise.all(stories.map(enrichStory));
  return res.json(enriched);
});

router.get("/stories/featured", async (_req, res) => {
  const stories = await db.select().from(storiesTable).where(eq(storiesTable.isFeatured, true)).orderBy(desc(storiesTable.createdAt));
  const enriched = await Promise.all(stories.map(enrichStory));
  return res.json(enriched);
});

router.get("/stories/by-collection", async (_req, res) => {
  const collections = await db.select().from(collectionsTable);
  const result = await Promise.all(
    collections.map(async (col) => {
      const stories = await db.select().from(storiesTable).where(eq(storiesTable.collectionId, col.id)).orderBy(desc(storiesTable.createdAt));
      const enriched = await Promise.all(stories.map(enrichStory));
      return { id: col.id, nameRu: col.nameRu, nameEn: col.nameEn, slug: col.slug, stories: enriched };
    })
  );
  return res.json(result);
});

router.get("/stories/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const [story] = await db.select().from(storiesTable).where(eq(storiesTable.id, id)).limit(1);
  if (!story) return res.status(404).json({ error: "Not found" });
  const enriched = await enrichStory(story);
  return res.json(enriched);
});

router.post("/stories", requireAdmin, async (req: any, res) => {
  const parsed = CreateStoryBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request" });
  const [story] = await db.insert(storiesTable).values({
    ...parsed.data,
    isFeatured: parsed.data.isFeatured ?? false,
  }).returning();
  const enriched = await enrichStory(story);
  return res.status(201).json(enriched);
});

router.put("/stories/:id", requireAdmin, async (req: any, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const parsed = UpdateStoryBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request" });
  const [story] = await db.update(storiesTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(storiesTable.id, id)).returning();
  if (!story) return res.status(404).json({ error: "Not found" });
  const enriched = await enrichStory(story);
  return res.json(enriched);
});

router.delete("/stories/:id", requireAdmin, async (_req: any, res) => {
  const id = parseInt(_req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  await db.delete(storiesTable).where(eq(storiesTable.id, id));
  return res.json({ success: true });
});

export default router;
