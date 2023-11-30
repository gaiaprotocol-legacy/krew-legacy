import { msg } from "common-app-module";
import { NotificationList } from "sofi-module";

export default class KrewNotificationList extends NotificationList {
  constructor() {
    super(".krew-notification-list", {
      storeName: "krew-notifications",
      emptyMessage: msg("notification-list-empty-message"),
    });
  }
}
