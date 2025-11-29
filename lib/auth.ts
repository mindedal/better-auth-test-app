import { betterAuth, type Adapter } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { twoFactor } from "better-auth/plugins";
import { redis } from "./redis";

const adapterFactory = prismaAdapter(prisma, {
  provider: "postgresql",
});

interface Where {
  field: string;
  value: unknown;
  operator?: string;
  connector?: "AND" | "OR";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JoinOption = any; 

const adapter = (...args: unknown[]) => {
  const adapterInstance = (adapterFactory as unknown as (...args: unknown[]) => Adapter)(...args);

  const stripName = (data: Record<string, unknown>) => {
    if (data && "name" in data) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { name, ...rest } = data;
      return rest;
    }
    return data;
  };

  const polyfillName = (user: Record<string, unknown>) => {
    if (user && !user.name) {
      user.name = (user.email as string | undefined)?.split("@")[0] || "User";
    }
    return user;
  };

  const originalCreate = adapterInstance.create;
  adapterInstance.create = async <T extends Record<string, unknown>, R = T>(params: { model: string; data: T; select?: string[]; forceAllowId?: boolean }) => {
    if (params.model === "user" || params.model === "User") {
      params.data = stripName(params.data as Record<string, unknown>) as T;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await originalCreate(params as any);
    if (params.model === "user" || params.model === "User") {
      return polyfillName(result as Record<string, unknown>) as unknown as R;
    }
    return result as R;
  };

  const originalUpdate = adapterInstance.update;
  adapterInstance.update = async <T>(params: { model: string; where: Where[]; update: Record<string, unknown> }) => {
    if (params.model === "user" || params.model === "User") {
      params.update = stripName(params.update);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await originalUpdate(params as any);
    if (params.model === "user" || params.model === "User") {
      return polyfillName(result as Record<string, unknown>) as unknown as T;
    }
    return result as T;
  };

  const originalFindOne = adapterInstance.findOne;
  adapterInstance.findOne = async <T>(params: { model: string; where: Where[]; select?: string[]; join?: JoinOption }) => {
    if (
      (params.model === "user" || params.model === "User") &&
      params.select &&
      Array.isArray(params.select)
    ) {
      params.select = params.select.filter((f: string) => f !== "name");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await originalFindOne(params as any);
    if ((params.model === "user" || params.model === "User") && result) {
      return polyfillName(result as Record<string, unknown>) as unknown as T;
    }
    return result as T;
  };

  const originalFindMany = adapterInstance.findMany;
  adapterInstance.findMany = async <T>(params: { model: string; where?: Where[]; select?: string[]; limit?: number; offset?: number; sortBy?: { field: string; direction: "desc" | "asc" }; join?: JoinOption }) => {
    if (
      (params.model === "user" || params.model === "User") &&
      params.select &&
      Array.isArray(params.select)
    ) {
      params.select = params.select.filter((f: string) => f !== "name");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await originalFindMany(params as any);
    if ((params.model === "user" || params.model === "User") && result) {
      return (result as Record<string, unknown>[]).map(polyfillName) as unknown as T[];
    }
    return result as T[];
  };

  return adapterInstance;
};

export const auth = betterAuth({
  database: adapter,
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
