export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { slug } = req.query;

  if (!slug) {
    return res.status(404).json({ error: "No route" });
  }

  if (slug[0] === "stories") {
    return res.status(200).json([
      { id: 1, title: "Story 1" },
      { id: 2, title: "Story 2" }
    ]);
  }

  if (slug[0] === "author") {
    return res.status(200).json({ name: "Author" });
  }

  if (slug[0] === "collections") {
    return res.status(200).json([
      { id: 1, name: "Collection" }
    ]);
  }

  return res.status(200).json({ ok: true });
}