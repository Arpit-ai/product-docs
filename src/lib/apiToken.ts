import prisma from "@/lib/prisma";

export async function validateApiToken(
  token: string
): Promise<{ valid: boolean; userId?: string }> {
  try {
    const apiToken = await prisma.apiToken.findUnique({
      where: { token },
    });

    if (!apiToken) {
      return { valid: false };
    }

    // Check if token is expired
    if (apiToken.expiresAt && new Date() > apiToken.expiresAt) {
      return { valid: false };
    }

    // Update last used timestamp
    await prisma.apiToken.update({
      where: { id: apiToken.id },
      data: { lastUsedAt: new Date() },
    });

    return { valid: true, userId: apiToken.userId };
  } catch (error) {
    console.error("Error validating API token:", error);
    return { valid: false };
  }
}

export async function generateApiToken(userId: string, name: string, expiresAt?: Date): Promise<string> {
  // Generate a secure random token
  const token = require("crypto").randomBytes(32).toString("hex");

  await prisma.apiToken.create({
    data: {
      token,
      name,
      userId,
      expiresAt,
    },
  });

  return token;
}
