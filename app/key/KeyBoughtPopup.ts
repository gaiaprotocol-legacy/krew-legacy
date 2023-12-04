import {
  Button,
  ButtonType,
  Component,
  el,
  LottieAnimation,
  msg,
  Popup,
  Router,
} from "common-app-module";
import Krew from "../database-interface/Krew.js";
import animationData from "./firecracker-animation.json" assert {
  type: "json"
};

export default class KeyBoughtPopup extends Popup {
  constructor(private krew: Krew) {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.key-bought-popup",
        el(
          "header",
          el(
            "h1",
            msg("key-bought-popup-title"),
          ),
        ),
        el(
          "main",
          new LottieAnimation(animationData),
          el(
            "p",
            msg("key-bought-popup-message", {
              krew: krew.name ?? "Krew",
            }),
          ),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel",
            click: () => this.delete(),
            title: msg("cancel-button"),
          }),
          new Button({
            type: ButtonType.Contained,
            tag: ".go-to-krew",
            click: () => this.goToKrew(),
            title: msg("key-bought-popup-go-to-krew-button"),
          }),
        ),
      ),
    );
  }

  private get krewUri(): string {
    if (this.krew.id.startsWith("p_")) {
      return `/p/${this.krew.id.substring(2)}`;
    } else if (this.krew.id.startsWith("c_")) {
      return `/c/${this.krew.id.substring(2)}`;
    }
    throw new Error("Invalid krew id");
  }

  private goToKrew() {
    Router.go(this.krewUri);
    this.delete();
  }
}
