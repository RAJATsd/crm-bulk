const Redis = require("ioredis");

class RateLimiter {
  constructor(redisConfig) {
    this.redis = new Redis(redisConfig);
  }

  async checkLimit(accountId, count) {
    const key = `ratelimit:${accountId}:${Math.floor(Date.now() / 60000)}`;
    const current = await this.redis.incrby(key, count);
    await this.redis.expire(key, 60); // 60s
    return current <= 10000;
  }
}

module.exports = { RateLimiter };
