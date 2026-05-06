import path from "node:path";
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

const connectionString = process.env.DATABASE_URL!;

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: connectionString,
  },
  // Adapter used by CLI migrate commands
  earlyAccess: true,
  adapter: () => new PrismaPg({ connectionString }),
} as Parameters<typeof defineConfig>[0]);
