/**
 * Permissions service
 * Handles access control for documents and folders
 */

import { prisma } from "@/lib/db";

export type AccessLevel = "OWNER" | "EDITOR" | "COMMENTER" | "VIEWER" | null;

/**
 * Check if a user has access to a document
 */
export async function checkDocumentAccess(
  userId: string,
  documentId: string,
  requiredLevel: AccessLevel = "VIEWER"
): Promise<boolean> {
  if (!userId || !documentId) return false;

  // Owner (creator) always has access
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { createdBy: true },
  });

  if (document?.createdBy === userId) return true;

  // Check document-level access
  const docAccess = await prisma.documentAccess.findUnique({
    where: { documentId_userId: { documentId, userId } },
    select: { role: true },
  });

  if (!docAccess) return false;

  // Check if user has required access level
  const accessHierarchy: Record<string, number> = {
    OWNER: 4,
    EDITOR: 3,
    COMMENTER: 2,
    VIEWER: 1,
  };

  const userLevel = accessHierarchy[docAccess.role] || 0;
  const requiredLevelValue = accessHierarchy[requiredLevel as string] || 0;

  return userLevel >= requiredLevelValue;
}

/**
 * Check if a user has access to a folder
 */
export async function checkFolderAccess(
  userId: string,
  folderId: string,
  requiredLevel: AccessLevel = "VIEWER"
): Promise<boolean> {
  if (!userId || !folderId) return false;

  // Check folder-level access
  const folderAccess = await prisma.folderAccess.findUnique({
    where: { folderId_userId: { folderId, userId } },
    select: { role: true },
  });

  if (!folderAccess) return false;

  const accessHierarchy: Record<string, number> = {
    OWNER: 4,
    EDITOR: 3,
    COMMENTER: 2,
    VIEWER: 1,
  };

  const userLevel = accessHierarchy[folderAccess.role] || 0;
  const requiredLevelValue = accessHierarchy[requiredLevel as string] || 0;

  return userLevel >= requiredLevelValue;
}

/**
 * Get access level for a user on a document
 */
export async function getDocumentAccessLevel(
  userId: string,
  documentId: string
): Promise<AccessLevel> {
  if (!userId || !documentId) return null;

  // Owner (creator) has OWNER level
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { createdBy: true },
  });

  if (document?.createdBy === userId) return "OWNER";

  // Check document access
  const docAccess = await prisma.documentAccess.findUnique({
    where: { documentId_userId: { documentId, userId } },
    select: { role: true },
  });

  return (docAccess?.role as AccessLevel) || null;
}

/**
 * Get access level for a user on a folder
 */
export async function getFolderAccessLevel(
  userId: string,
  folderId: string
): Promise<AccessLevel> {
  if (!userId || !folderId) return null;

  const folderAccess = await prisma.folderAccess.findUnique({
    where: { folderId_userId: { folderId, userId } },
    select: { role: true },
  });

  return (folderAccess?.role as AccessLevel) || null;
}

/**
 * Grant access to a user for a document
 */
export async function grantDocumentAccess(
  documentId: string,
  userId: string,
  role: "OWNER" | "EDITOR" | "COMMENTER" | "VIEWER"
) {
  return prisma.documentAccess.upsert({
    where: { documentId_userId: { documentId, userId } },
    create: { documentId, userId, role },
    update: { role },
  });
}

/**
 * Revoke access to a document
 */
export async function revokeDocumentAccess(
  documentId: string,
  userId: string
) {
  return prisma.documentAccess.delete({
    where: { documentId_userId: { documentId, userId } },
  });
}

/**
 * Grant access to a user for a folder
 */
export async function grantFolderAccess(
  folderId: string,
  userId: string,
  role: "OWNER" | "EDITOR" | "COMMENTER" | "VIEWER"
) {
  return prisma.folderAccess.upsert({
    where: { folderId_userId: { folderId, userId } },
    create: { folderId, userId, role },
    update: { role },
  });
}

/**
 * Revoke access to a folder
 */
export async function revokeFolderAccess(
  folderId: string,
  userId: string
) {
  return prisma.folderAccess.delete({
    where: { folderId_userId: { folderId, userId } },
  });
}

/**
 * List all users with access to a document
 */
export async function listDocumentAccess(documentId: string) {
  return prisma.documentAccess.findMany({
    where: { documentId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

/**
 * List all users with access to a folder
 */
export async function listFolderAccess(folderId: string) {
  return prisma.folderAccess.findMany({
    where: { folderId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

/**
 * Create a public share link for a document or folder
 */
export async function createShareLink(
  resourceType: "document" | "folder",
  resourceId: string,
  createdBy: string,
  expiresAt?: Date
) {
  const token = generateSecureToken();

  return prisma.sharedLink.create({
    data: {
      resourceType,
      resourceId,
      token,
      expiresAt,
      createdBy,
    },
  });
}

/**
 * Get share link by token
 */
export async function getShareLink(token: string) {
  return prisma.sharedLink.findUnique({
    where: { token },
  });
}

/**
 * Increment view count for a share link
 */
export async function recordShareLinkView(token: string) {
  return prisma.sharedLink.update({
    where: { token },
    data: { viewCount: { increment: 1 } },
  });
}

/**
 * Revoke a share link
 */
export async function revokeShareLink(linkId: string) {
  return prisma.sharedLink.delete({
    where: { id: linkId },
  });
}

/**
 * List all share links for a resource
 */
export async function listShareLinks(resourceId: string) {
  return prisma.sharedLink.findMany({
    where: { resourceId },
    select: {
      id: true,
      token: true,
      expiresAt: true,
      viewCount: true,
      createdAt: true,
    },
  });
}

/**
 * Generate a secure random token for share links
 */
function generateSecureToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
