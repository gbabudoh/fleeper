import "dotenv/config";
import { prisma } from "../lib/db";
import { createHash, randomBytes } from "node:crypto";

async function main() {
  console.log("🚀 Setting up test data...");

  // 1. Find or create a test user
  let user = await prisma.user.findUnique({
    where: { email: "test@example.com" }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "test@example.com",
        handle: "tester",
        name: "Test User",
        passwordHash: "dummy-hash",
      }
    });
    console.log("✅ Created test user: tester");
  } else {
    console.log("ℹ️ Using existing test user: tester");
  }

  // 2. Create default pools for the user
  const poolsCount = await prisma.incomePool.count({ where: { userId: user.id } });
  if (poolsCount === 0) {
    await prisma.incomePool.createMany({
      data: [
        { userId: user.id, name: "Main Spend", percentage: 70, color: "#00D4A8", order: 0 },
        { userId: user.id, name: "Tax Vault", percentage: 20, color: "#E8920A", order: 1 },
        { userId: user.id, name: "Growth", percentage: 10, color: "#8B5CF6", order: 2 },
      ]
    });
    console.log("✅ Created 3 default pools");
  }

  // 3. Create an API key
  const rawKey = `flp_${randomBytes(20).toString("hex")}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const prefix = rawKey.slice(0, 12);

  await prisma.apiKey.create({
    data: {
      userId: user.id,
      name: "SDK Test Key",
      keyHash,
      prefix,
      isActive: true,
    }
  });

  console.log("\n🔥 SETUP COMPLETE 🔥");
  console.log("-------------------");
  console.log(`API KEY: ${rawKey}`);
  console.log("-------------------\n");
  console.log("Use this key for testing the V1 API.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
