import { Ratelimit } from "@upstash/ratelimit";

export const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requêtes par minute
});