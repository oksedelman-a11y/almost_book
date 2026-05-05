import { Router } from "express";
import { db } from "@workspace/db";
import { guestbookTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { CreateGuestbookEntryBody } from "@workspace/api-zod";

const router = Router();

router.get("/guestbook", async (_req, res) => {
  const entries = await db.select().from(guestbookTable).orderBy(desc(guestbookTable.createdAt));
  return res.json(entries);
});

router.post("/guestbook", async (req, res) => {
  const parsed = CreateGuestbookEntryBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request" });
  const [entry] = await db.insert(guestbookTable).values(parsed.data).returning();
  return res.status(201).json(entry);
});

export default router;
