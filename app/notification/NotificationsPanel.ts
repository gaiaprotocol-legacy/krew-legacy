import { BodyNode, DomNode, el, msg, Router } from "common-app-module";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import LoginRequiredDisplay from "../user/LoginRequiredDisplay.js";
import KrewNotificationList from "./KrewNotificationList.js";

export default class NotificationsPanel extends DomNode {
  private list: KrewNotificationList | undefined;

  constructor() {
    super(".notifications-panel");
    this.append(
      el(
        "header",
        el("h1", msg("notification-title")),
        el("a", msg("notification-more-button"), {
          click: () => Router.go("/notifications"),
        }),
      ),
      KrewSignedUserManager.signed
        ? this.list = new KrewNotificationList(
          KrewSignedUserManager.user!.user_id,
        )
        : new LoginRequiredDisplay(),
    );

    BodyNode.append(this);
    window.addEventListener("click", this.windowClickHandler);

    this.onDelegate(Router, "go", () => this.delete());
  }

  private windowClickHandler = (event: MouseEvent) => {
    if (!this.domElement.contains(event.target as Node)) {
      this.delete();
    }
  };

  public delete() {
    window.removeEventListener("click", this.windowClickHandler);
    super.delete();
  }
}
