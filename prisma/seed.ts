/**
 * Fleeper seed script
 * Run: npx tsx prisma/seed.ts
 */
import { config } from "dotenv";
import { resolve } from "path";

// Load env vars before importing Prisma
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set — configure .env.local first.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter } as never);

function makeTxId(): string {
  return "FLP-" + randomBytes(4).toString("hex").toUpperCase();
}

async function main() {
  console.log("🌱 Seeding Fleeper database...\n");

  // ── 1. Demo User ─────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password101", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@fleeper.com" },
    update: { passwordHash, isVerified: true, name: "Demo User", handle: "demo" },
    create: {
      email: "demo@fleeper.com",
      handle: "demo",
      name: "Demo User",
      passwordHash,
      isVerified: true,
    },
  });
  console.log(`✅ User: ${user.name} (${user.email}) — handle: @${user.handle}`);

  // ── 2. Income Pools ───────────────────────────────────────────────────────
  await prisma.incomePool.deleteMany({ where: { userId: user.id } });

  const pools = await prisma.$transaction([
    prisma.incomePool.create({
      data: {
        userId: user.id,
        name: "Operating",
        percentage: 65,
        color: "#00FFCC",
        bankName: "Barclays",
        bankLastFour: "4821",
        order: 0,
        isActive: true,
      },
    }),
    prisma.incomePool.create({
      data: {
        userId: user.id,
        name: "Tax Vault",
        percentage: 25,
        color: "#FFB347",
        bankName: "Monzo Savings",
        bankLastFour: "3307",
        order: 1,
        isActive: true,
      },
    }),
    prisma.incomePool.create({
      data: {
        userId: user.id,
        name: "Profit",
        percentage: 10,
        color: "#8B5CF6",
        bankName: "Marcus",
        bankLastFour: "1120",
        order: 2,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Income pools: Operating (65%) · Tax Vault (25%) · Profit (10%)`);

  // ── 3. Sample Transactions ────────────────────────────────────────────────
  const txData = [
    { desc: "UI Design Project",        gross: 150000, daysAgo: 0 },
    { desc: "Strategy Consultation",    gross:  50000, daysAgo: 1 },
    { desc: "Brand Identity Package",   gross: 300000, daysAgo: 2 },
    { desc: "Website Audit",            gross:  25000, daysAgo: 2 },
    { desc: "Webflow Development",      gross: 200000, daysAgo: 5 },
    { desc: "Logo Refresh",             gross:  75000, daysAgo: 7 },
  ];

  for (const t of txData) {
    const provision = Math.round(t.gross * 0.029) + 30;
    const net = t.gross - provision;

    const tx = await prisma.$transaction(async (db) => {
      const mainTx = await db.transaction.create({
        data: {
          userId: user.id,
          grossAmount: t.gross,
          platformFee: provision,
          netAmount: net,
          currency: "USD",
          status: "succeeded",
          description: t.desc,
          paymentRef: makeTxId(),
          createdAt: new Date(Date.now() - t.daysAgo * 86_400_000),
          updatedAt: new Date(Date.now() - t.daysAgo * 86_400_000),
        },
      });

      for (const pool of pools) {
        const pct = Number(pool.percentage);
        const amt = Math.round((net * pct) / 100);
        await db.transactionSplit.create({
          data: {
            transactionId: mainTx.id,
            poolId: pool.id,
            amount: amt,
            status: "settled",
          },
        });
      }

      return mainTx;
    });

    console.log(`  💸 ${t.desc}: $${(t.gross / 100).toFixed(2)} → net $${(net / 100).toFixed(2)} (ref: ${tx.paymentRef})`);
  }

  // ── 4. Payment Links ──────────────────────────────────────────────────────
  await prisma.paymentLink.deleteMany({ where: { userId: user.id } });

  await prisma.$transaction([
    prisma.paymentLink.create({ data: { userId: user.id, title: "1-Hour Strategy Session",  description: "Deep-dive into your product, brand, or growth strategy.", amount:  20000, isFlexible: false, slug: "strategy-session", isActive: true } }),
    prisma.paymentLink.create({ data: { userId: user.id, title: "UI/UX Design Sprint",      description: "Full week of design work — wireframes to high-fidelity.",  amount: 150000, isFlexible: false, slug: "design-sprint",    isActive: true } }),
    prisma.paymentLink.create({ data: { userId: user.id, title: "Brand Identity Package",   description: "Logo, colour system, typography, and brand guidelines.",    amount: 300000, isFlexible: false, slug: "brand-identity",   isActive: true } }),
    prisma.paymentLink.create({ data: { userId: user.id, title: "Custom Amount",            description: "Send a tip or pay for a custom service.",                   amount:   null, isFlexible: true,  slug: "custom",           isActive: true } }),
  ]);
  console.log(`✅ Payment links created`);

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Seed complete!

  Email:    demo@fleeper.com
  Password: password101
  Profile:  http://localhost:3000/demo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

main()
  .catch((e) => { console.error("Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
