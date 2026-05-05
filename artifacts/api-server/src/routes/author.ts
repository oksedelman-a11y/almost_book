import { Router } from "express";
import { db } from "@workspace/db";
import { authorTable } from "@workspace/db";
import { requireAdmin } from "./auth";
import { UpdateAuthorBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/author", async (_req, res) => {
  const [author] = await db.select().from(authorTable).limit(1);
  if (!author) return res.status(404).json({ error: "Author not found" });
  return res.json(author);
});

router.put("/author", requireAdmin, async (req: any, res) => {
  const parsed = UpdateAuthorBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request" });
  const [existing] = await db.select().from(authorTable).limit(1);
  if (!existing) return res.status(404).json({ error: "Author not found" });
  const [updated] = await db.update(authorTable).set(parsed.data).where(eq(authorTable.id, existing.id)).returning();
  return res.json(updated);
});

export default router;
