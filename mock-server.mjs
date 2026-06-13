import { createServer } from "http";

const leakStates = ["Normal", "Normal", "Normal", "Warning", "Leak Detected"];

function randomLatest() {
  return {
    waterLevel: +(60 + Math.random() * 20).toFixed(1),
    tankPercentage: Math.round(60 + Math.random() * 30),
    flowRate: +(Math.random() * 6).toFixed(2),
    temperature: +(24 + Math.random() * 10).toFixed(1),
    dailyUsage: Math.round(120 + Math.random() * 100),
    leakStatus: leakStates[Math.floor(Math.random() * leakStates.length)],
    timestamp: new Date().toISOString(),
  };
}

function history(limit = 50) {
  const now = Date.now();
  return Array.from({ length: limit }).map((_, i) => {
    const t = new Date(now - (limit - i) * 15 * 60 * 1000);
    return {
      timestamp: t.toISOString(),
      waterLevel: +(55 + Math.sin(i / 4) * 10 + Math.random() * 2).toFixed(1),
      flowRate: +(Math.abs(Math.sin(i / 3)) * 5).toFixed(2),
      temperature: +(26 + Math.sin(i / 6) * 4).toFixed(1),
      tankPercentage: Math.round(60 + Math.sin(i / 4) * 15),
      dailyUsage: Math.round((i % 24) * 8),
      leakStatus: "Normal",
    };
  });
}

const PORT = process.env.MOCK_PORT || 5000;

createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/api/latest") {
    res.end(JSON.stringify(randomLatest()));
  } else if (url.pathname === "/api/history") {
    const limit = Number(url.searchParams.get("limit")) || 50;
    res.end(JSON.stringify(history(limit)));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "not found" }));
  }
}).listen(PORT, () => console.log(`Mock API listening on http://localhost:${PORT}`));
