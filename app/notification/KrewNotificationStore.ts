import { NotificationSelectQuery, NotificationStore } from "sofi-module";
import KrewNotification from "../database-interface/KrewNotification.js";

class KrewNotificationStore extends NotificationStore<KrewNotification> {
  constructor() {
    super("notifications", NotificationSelectQuery, 100);
  }
}

export default new KrewNotificationStore();
