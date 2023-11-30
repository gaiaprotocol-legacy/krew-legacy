import { msg } from "common-app-module";
import { NotificationList } from "sofi-module";
import KrewLoadingAnimation from "../KrewLoadingAnimation.js";
import KrewNotification from "../database-interface/KrewNotification.js";
import KrewNotificationListItem from "./KrewNotificationListItem.js";
import KrewNotificationStore from "./KrewNotificationStore.js";

export default class KrewNotificationList
  extends NotificationList<KrewNotification> {
  constructor(private userId: string) {
    super(".krew-notification-list", {
      userId,
      tableName: "notifications",
      storeName: "krew-notifications",
      emptyMessage: msg("notification-list-empty-message"),
    }, new KrewLoadingAnimation());
  }

  protected addNotificationItem(notification: KrewNotification): void {
    this.append(new KrewNotificationListItem(notification));
  }

  protected async fetchNotifications(): Promise<KrewNotification[]> {
    return await KrewNotificationStore.fetchNotifications(this.userId);
  }
}
