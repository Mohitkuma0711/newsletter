const { Redis } = require("@upstash/redis");

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return res.status(500).json({ error: "Redis not configured" });
  }

  let body = req.body;
  if (typeof body === "string") body = JSON.parse(body);

  const { deviceId, deviceName, ip, city, region, country, org, lat, lon, timestamp } = body;

  if (!deviceId) return res.status(400).json({ error: "deviceId required" });

  const deviceData = {
    deviceId,
    deviceName: deviceName || "Unknown",
    ip: ip || null,
    city: city || null,
    region: region || null,
    country: country || null,
    org: org || null,
    lat: lat || null,
    lon: lon || null,
    timestamp: timestamp || new Date().toISOString(),
  };

  try {
    await redis.hset("devices", { [deviceId]: JSON.stringify(deviceData) });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
