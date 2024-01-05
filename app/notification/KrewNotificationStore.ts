import { NotificationStore } from "@common-module/social";
import KrewNotification, {
  KrewNotificationSelectQuery,
} from "../database-interface/KrewNotification.js";

class KrewNotificationStore extends NotificationStore<KrewNotification> {
  constructor() {
    super("notifications", KrewNotificationSelectQuery, 100);
  }
}

export default new KrewNotificationStore();
