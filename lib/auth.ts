import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { twoFactor } from "better-auth/plugins";
import { redis } from "./redis";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secondaryStorage: {
    get: async (key) => {
      const value = await redis.get(key);
      return value ? JSON.stringify(value) : null;
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(key, value, { ex: ttl });
      else await redis.set(key, value, { ex: 60 * 60 * 24 }); // Default 24 hours
      return;
    },
    // @ts-expect-error This ensures the function's return type is Promise<void>, satisfying better-auth's type definition.
    delete: async (key) => await redis.del(key),
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
  rateLimit: {
    window: 60,
    max: 100,
    storage: "secondary-storage",
  },
  session: {
    expiresIn: 86400, // 24 hours absolute max TTL
    cookieCache: {
      enabled: true,
      maxAge: 1800, // 30 minutes sliding TTL
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        required: false,
      },
    },
  },
  plugins: [
    twoFactor(),
  ],
});
