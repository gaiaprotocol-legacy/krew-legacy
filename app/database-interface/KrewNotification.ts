import { Notification } from "sofi-module";

export enum KrewoNotificationType {
  BUY_KEY,
  SELL_KEY,
  FOLLOW,
  POST_LIKE,
  REPOST,
  POST_COMMENT,
  POST_TAG,
}

export default interface KrewoNotification
  extends Notification<KrewoNotificationType> {
  type: KrewoNotificationType;
  amount?: number;
}
