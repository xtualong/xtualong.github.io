const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3001;
const DATA_FILE = "/data/likes.json";

function load() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return {};
  }
}

function save(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data));
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const server = http.createServer((req, res) => {
  cors(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // GET /like?url=/posts/xxx/  → 返回点赞数
  if (req.method === "GET" && url.pathname === "/like") {
    const key = url.searchParams.get("url");
    if (!key) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "url required" }));
    }
    const data = load();
    const count = data[key] || 0;
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ url: key, count }));
  }

  // POST /like  body: {"url": "/posts/xxx/"}  → 点赞 +1
  if (req.method === "POST" && url.pathname === "/like") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { url: key } = JSON.parse(body);
        if (!key) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "url required" }));
        }
        const data = load();
        data[key] = (data[key] || 0) + 1;
        save(data);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ url: key, count: data[key] }));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "invalid json" }));
      }
    });
    return;
  }

  // GET /health
  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true }));
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Like API running on port ${PORT}`);
});
