import { Notification } from "sofi-module";

export enum KrewNotificationType {
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
  amount?: number;
}
