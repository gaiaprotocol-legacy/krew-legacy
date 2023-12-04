import { BodyNode, DomNode, el } from "common-app-module";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import LoginRequiredDisplay from "../user/LoginRequiredDisplay.js";
import KrewNotificationList from "./KrewNotificationList.js";

export default class NotificationsPanel extends DomNode {
  private list: KrewNotificationList | undefined;

  constructor() {
    super(".notifications-panel");
    this.append(
      el("h1", "Notifications"),
      KrewSignedUserManager.signed
        ? this.list = new KrewNotificationList(
          KrewSignedUserManager.user!.user_id,
        )
        : new LoginRequiredDisplay(),
    );
    this.list?.on("changeUri", () => this.delete());
    BodyNode.append(this);
    window.addEventListener("click", this.windowClickHandler);
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
