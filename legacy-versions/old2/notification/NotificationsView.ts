import { el, msg, View } from "@common-module/app";
import Layout from "../layout/Layout.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import LoginRequiredDisplay from "../user/LoginRequiredDisplay.js";
import KrewNotificationList from "./KrewNotificationList.js";

export default class NotificationsView extends View {
  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".notifications-view",
        el("h1", msg("notification-title")),
        KrewSignedUserManager.signed
          ? new KrewNotificationList(KrewSignedUserManager.user!.user_id)
          : new LoginRequiredDisplay(),
      ),
    );
  }
}
