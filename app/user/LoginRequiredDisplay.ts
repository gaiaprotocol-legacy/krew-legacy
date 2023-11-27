import { Button, DomNode, el, msg } from "common-app-module";
import KrewSignedUserManager from "./KrewSignedUserManager.js";
import MaterialIcon from "../MaterialIcon.js";

export default class LoginRequiredDisplay extends DomNode {
  constructor() {
    super(".login-required");
    this.append(
      new MaterialIcon("lock"),
      el(
        "main",
        el("p", msg("login-required-message")),
        new Button({
          title: msg("login-required-login-button"),
          click: () => KrewSignedUserManager.signIn(),
        }),
      ),
    );
  }
}
