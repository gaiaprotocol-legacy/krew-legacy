import { Notification, NotificationSelectQuery } from "@common-module/social";

export enum KrewNotificationType {
  CREATE_KEY,
  BUY_KEY,
  SELL_KEY,
  FOLLOW,
  POST_LIKE,
  REPOST,
  POST_COMMENT,
  POST_TAG,
}

export default interface KrewNotification
  extends Notification<KrewNotificationType> {
  type: KrewNotificationType;
  krew?: {
    id: string;
    name?: string;
  };
  amount?: number;
  post_id?: string;
  post_message?: string;
}

export const KrewNotificationSelectQuery = NotificationSelectQuery +
  ", krew(id, name)";
