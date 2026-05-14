export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { slug } = req.query;

  if (!slug || !slug.length) {
    return res.status(404).json({ error: "No route" });
  }

  // STORIES
  if (slug[0] === "stories") {
    return res.status(200).json([
      {
        id: "1",
        title: "Story 1",
        excerpt: "Test story",
        content: "Hello world",
        coverImage: "",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Story 2",
        excerpt: "Second story",
        content: "Another story",
        coverImage: "",
        createdAt: new Date().toISOString(),
      }
    ]);
  }

  // AUTHOR
  if (slug[0] === "author") {
    return res.status(200).json({
      name: "Author",
      bio: "Test bio",
      avatar: ""
    });
  }

  // COLLECTIONS
  if (slug[0] === "collections") {
    return res.status(200).json([
      {
        id: "1",
        title: "Collection 1"
      }
    ]);
  }

  return res.status(404).json({
    error: "Not found"
  });
}