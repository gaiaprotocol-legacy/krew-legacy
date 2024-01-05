import { msg } from "@common-module/app";
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
    this.addAllowedEvents("changeUri");
  }

  protected addNotificationItem(
    notification: KrewNotification,
    isNew: boolean,
  ): void {
    const item = new KrewNotificationListItem(notification);
    isNew ? this.prepend(item) : this.append(item);
  }

  protected async fetchNotification(
    id: number,
  ): Promise<KrewNotification | undefined> {
    return await KrewNotificationStore.fetchNotification(id);
  }

  protected async fetchNotifications(): Promise<KrewNotification[]> {
    return await KrewNotificationStore.fetchNotifications(this.userId);
  }
}
