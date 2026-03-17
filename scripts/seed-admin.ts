/**
 * Creates the initial SUPER_ADMIN account.
 * Run with: DATABASE_URL=... npx tsx scripts/seed-admin.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma  = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  const email    = process.env.ADMIN_EMAIL    ?? "superadmin@fleeper.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin@fleeper123!";
  const name     = process.env.ADMIN_NAME     ?? "Super Admin";

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`✓ Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.adminUser.create({
    data: { email, name, passwordHash, role: "SUPER_ADMIN" },
  });

  console.log(`✓ SUPER_ADMIN created:`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  ID:       ${admin.id}`);
  console.log(`\n  Login at: http://localhost:3000/admin-login`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
