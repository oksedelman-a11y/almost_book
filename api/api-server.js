export default function handler(req, res) {
  // CORS (ОБЯЗАТЕЛЬНО ДО ВСЕГО)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // временная проверка, что API живой
  if (req.url.includes("/api/author")) {
    return res.status(200).json({ ok: true, source: "author" });
  }

  if (req.url.includes("/api/stories")) {
    return res.status(200).json({ ok: true, source: "stories" });
  }

  if (req.url.includes("/api/collections")) {
    return res.status(200).json({ ok: true, source: "collections" });
  }

  return res.status(200).json({ ok: true });
}