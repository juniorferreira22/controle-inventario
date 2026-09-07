import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL;

if (!connectionString) throw new Error("DATABASE_URL nao foi definido.");

neonConfig.webSocketConstructor = ws;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;