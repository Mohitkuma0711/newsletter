const { Redis } = require("@upstash/redis");

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return res.status(500).json({ error: "Redis not configured" });
  }

  try {
    const allDevices = await redis.hgetall("devices");
    const devices = Object.values(allDevices)
      .map(d => JSON.parse(d))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.status(200).json(devices);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
