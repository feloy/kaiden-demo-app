const path = require("path");
const { randomUUID } = require("crypto");
const express = require("express");
const Redis = require("ioredis");

const PORT = Number(process.env.PORT) || 3000;
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const LIST_KEY = "feature-requests";

const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/feature-requests", async (_req, res) => {
  try {
    const raw = await redis.lrange(LIST_KEY, 0, 99);
    const items = raw
      .map((s) => {
        try {
          return JSON.parse(s);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    res.json(items);
  } catch (e) {
    res.status(503).json({ error: "Redis unavailable", detail: String(e.message) });
  }
});

app.post("/api/feature-requests", async (req, res) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }
  const detail =
    typeof req.body?.detail === "string" ? req.body.detail.trim().slice(0, 2000) : "";
  const item = {
    id: randomUUID(),
    title: title.slice(0, 500),
    detail,
    createdAt: new Date().toISOString(),
  };
  try {
    await redis.lpush(LIST_KEY, JSON.stringify(item));
    res.status(201).json(item);
  } catch (e) {
    res.status(503).json({ error: "Redis unavailable", detail: String(e.message) });
  }
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
