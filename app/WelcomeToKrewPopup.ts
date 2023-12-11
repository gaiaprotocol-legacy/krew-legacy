import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  msg,
  Popup,
  Store,
} from "common-app-module";
import CreateKrewPopup from "./krew/CreateKrewPopup.js";

export default class WelcomeToKrewPopup extends Popup {
  private store = new Store("welcome");
  private checkbox: DomNode<HTMLInputElement>;

  constructor() {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.welcome-to-krew-popup",
        el("header", el("h1", msg("welcome-to-krew-popup-title"))),
        el(
          "main",
          el("p", msg("welcome-to-krew-popup-message")),
          el(
            "label",
            this.checkbox = el("input", { type: "checkbox" }),
            msg("welcome-to-krew-popup-skip-checkbox"),
          ),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".later",
            click: () => {
              if (this.checkbox.domElement.checked) {
                this.store.set("skip", true);
              }
              this.delete();
            },
            title: msg("welcome-to-krew-popup-later-button"),
          }),
          new Button({
            tag: ".create-krew",
            click: () => {
              new CreateKrewPopup();
              this.delete();
            },
            title: msg("welcome-to-krew-popup-create-button"),
          }),
        ),
      ),
    );
  }
}
