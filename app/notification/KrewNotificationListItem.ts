import { NotificationListItem } from "sofi-module";
import KrewNotification, {
  KrewNotificationType,
} from "../database-interface/KrewNotification.js";

export default class KrewNotificationListItem
  extends NotificationListItem<KrewNotificationType> {
  constructor(notification: KrewNotification) {
    super(".krew-notification-list-item", notification);
  }
}
