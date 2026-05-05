import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";

const router = Router();

const JWT_SECRET = process.env.SESSION_SECRET ?? "fallback-secret-change-me";

export function createToken(userId: number, username: string, isAdmin: boolean) {
  return jwt.sign({ userId, username, isAdmin }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: number; username: string; isAdmin: boolean } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; username: string; isAdmin: boolean };
  } catch {
    return null;
  }
}

export function requireAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid token" });
  }
  req.user = payload;
  next();
}

export function requireAdmin(req: any, res: any, next: any) {
  requireAuth(req, res, () => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  });
}

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request" });
  }
  const { username, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = createToken(user.id, user.username, user.isAdmin);
  return res.json({ token, user: { id: user.id, username: user.username, isAdmin: user.isAdmin } });
});

router.post("/auth/logout", (_req, res) => {
  return res.json({ success: true });
});

router.get("/auth/me", requireAuth, async (req: any, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.userId)).limit(1);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }
  return res.json({ id: user.id, username: user.username, isAdmin: user.isAdmin });
});

export default router;
