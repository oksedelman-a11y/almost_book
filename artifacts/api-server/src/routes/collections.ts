import { Router } from "express";
import { db } from "@workspace/db";
import { collectionsTable, storiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "./auth";
import { CreateCollectionBody } from "@workspace/api-zod";

const router = Router();

router.get("/collections", async (_req, res) => {
  const collections = await db.select().from(collectionsTable);
  const result = await Promise.all(
    collections.map(async (col) => {
      const stories = await db.select({ id: storiesTable.id }).from(storiesTable).where(eq(storiesTable.collectionId, col.id));
      return { ...col, storyCount: stories.length };
    })
  );
  return res.json(result);
});

router.post("/collections", requireAdmin, async (req: any, res) => {
  const parsed = CreateCollectionBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request" });
  const [col] = await db.insert(collectionsTable).values(parsed.data).returning();
  return res.status(201).json({ ...col, storyCount: 0 });
});

export default router;
