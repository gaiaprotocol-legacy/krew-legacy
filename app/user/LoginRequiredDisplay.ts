import { DomNode, el, msg } from "common-app-module";
import KrewSignedUserManager from "./KrewSignedUserManager.js";

export default class LoginRequiredDisplay extends DomNode {
  constructor() {
    super(".login-required");
    this.append(
      el("p", msg("login-required-message")),
      el("button", msg("login-required-login-button"), {
        click: () => KrewSignedUserManager.signIn(),
      }),
    );
  }
}
