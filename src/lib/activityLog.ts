import { prisma } from "@/lib/db";

export type ActivityAction =
  | "CREATE_DOCUMENT"
  | "UPDATE_DOCUMENT"
  | "DELETE_DOCUMENT"
  | "PUBLISH_DOCUMENT"
  | "ARCHIVE_DOCUMENT"
  | "CREATE_FOLDER"
  | "UPDATE_FOLDER"
  | "DELETE_FOLDER"
  | "UPLOAD_MEDIA"
  | "CREATE_USER"
  | "UPDATE_USER"
  | "DELETE_USER"
  | "LOGIN"
  | "LOGOUT";

export async function logActivity(
  action: ActivityAction,
  userId: string,
  documentId?: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        userId,
        documentId: documentId || null,
        metadata: metadata ? JSON.stringify(metadata) : "",
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

export async function getActivityLog(limit: number = 50, offset: number = 0) {
  const activities = await prisma.activityLog.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      document: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  const total = await prisma.activityLog.count();

  return {
    activities,
    total,
    limit,
    offset,
  };
}
