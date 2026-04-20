import { NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "./db";

/**
 * Validates a Public API Key from the Authorization header.
 * 
 * Logic:
 * 1. Extract "Bearer flp_..."
 * 2. Hash the raw key with SHA-256
 * 3. Find the hash in the DB
 * 4. Ensure key is active and return the associated User
 */
export async function validateApiKey(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const rawKey = authHeader.substring(7); // Remove "Bearer "
  
  // Basic sanity check on format
  if (!rawKey.startsWith("flp_")) {
    return null;
  }

  const keyHash = createHash("sha256").update(rawKey).digest("hex");

  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          handle: true,
          name: true,
        },
      },
    },
  });

  if (!apiKeyRecord || !apiKeyRecord.isActive) {
    return null;
  }

  // Update lastUsed timestamp (async, don't block)
  prisma.apiKey.update({
    where: { id: apiKeyRecord.id },
    data: { lastUsed: new Date() },
  }).catch(() => {});

  return apiKeyRecord.user;
}
