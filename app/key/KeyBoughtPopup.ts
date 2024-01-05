import {
  Button,
  ButtonType,
  Component,
  el,
  LottieAnimation,
  msg,
  Popup,
  Router,
} from "@common-module/app";
import Krew from "../database-interface/Krew.js";
import KrewUtil from "../krew/KrewUtil.js";
import animationData from "./firecracker-animation.json" assert {
  type: "json",
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
              krew: KrewUtil.getName(krew),
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
            click: () => Router.go(this.krewUri),
            title: msg("key-bought-popup-go-to-krew-button"),
          }),
        ),
      ),
    );

    this.onDelegate(Router, "go", () => this.delete());
  }

  private get krewUri(): string {
    if (this.krew.id.startsWith("p_")) {
      return `/p/${this.krew.id.substring(2)}`;
    } else if (this.krew.id.startsWith("c_")) {
      return `/c/${this.krew.id.substring(2)}`;
    }
    throw new Error("Invalid krew id");
  }
}
