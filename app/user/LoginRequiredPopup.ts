import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  msg,
  Popup,
} from "common-app-module";
import KrewSignedUserManager from "./KrewSignedUserManager.js";

export default class LoginRequiredPopup extends Popup {
  public content: DomNode;

  constructor() {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".popup.login-required-popup",
        el("header", el("h1", msg("login-required-title"))),
        el(
          "main",
          el("p", msg("login-required-message")),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel-button",
            click: () => this.delete(),
            title: msg("cancel-button"),
          }),
          new Button({
            tag: ".login-button",
            click: () => KrewSignedUserManager.signIn(),
            title: msg("login-required-login-button"),
          }),
        ),
      ),
    );
  }
}
