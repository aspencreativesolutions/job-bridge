import { db } from "../db";

interface NotificationInput {
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, string>;
}

export async function createNotification(
  userId: string,
  input: NotificationInput
) {
  return db.notification.create({
    data: {
      userId,
      type: input.type,
      title: input.title,
      message: input.message,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });
}

export async function getUnreadNotifications(userId: string) {
  return db.notification.findMany({
    where: { userId, read: false },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markNotificationRead(id: string, userId: string) {
  return db.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
