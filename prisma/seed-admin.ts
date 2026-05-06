/**
 * Fleeper admin seed script
 * Creates a SUPER_ADMIN account for the admin panel.
 *
 * Credentials are read from env vars — never hardcoded.
 *
 * Usage (local):
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=yourpassword ADMIN_NAME="Your Name" npx tsx prisma/seed-admin.ts
 *
 * Usage via npm script:
 *   npm run seed:admin
 *
 * On Vercel / production:
 *   Set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME as one-time env vars and run via CLI.
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌  DATABASE_URL is not set.");
  process.exit(1);
}

const email    = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name     = process.env.ADMIN_NAME ?? "Super Admin";

if (!email || !password) {
  console.error("❌  ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.");
  console.error("    Example:");
  console.error('    ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=yourpassword npx tsx prisma/seed-admin.ts');
  process.exit(1);
}

if (password.length < 12) {
  console.error("❌  ADMIN_PASSWORD must be at least 12 characters.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma  = new PrismaClient({ adapter } as never);

async function main() {
  console.log("🔐 Seeding Fleeper admin account...\n");

  const passwordHash = await bcrypt.hash(password!, 12);

  const admin = await prisma.adminUser.upsert({
    where:  { email: email! },
    update: { passwordHash, name, role: "SUPER_ADMIN", isActive: true },
    create: { email: email!, name, passwordHash, role: "SUPER_ADMIN", isActive: true },
  });

  console.log(`✅ Admin account ready`);
  console.log(`   Name:  ${admin.name}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role:  ${admin.role}`);
  console.log(`   ID:    ${admin.id}`);
  console.log(`\n   Login at: /admin/login`);
}

main()
  .catch((e) => { console.error("Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
