import { switchNetwork } from "@wagmi/core";
import {
  Alert,
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  msg,
  Popup,
} from "common-app-module";
import EnvironmentManager from "../EnvironmentManager.js";

export default class SwitchToKromaPopup extends Popup {
  public content: DomNode;

  constructor() {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".popup.switch-to-kroma-popup",
        el("header", el("h1", msg("switch-to-kroma-popup-title"))),
        el(
          "main",
          el("img.banner", { src: "/images/kroma-banner.jpg" }),
          el("p", msg("switch-to-kroma-popup-message")),
          el(
            "p",
            el("a", msg("switch-to-kroma-popup-what-is-kroma"), {
              href: "https://kroma.network/",
              target: "_blank",
            }),
          ),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel-button",
            click: () => {
              new Alert({
                title: msg("switch-to-kroma-popup-warning-title"),
                message: msg("switch-to-kroma-popup-warning-message"),
                confirmTitle: msg(
                  "switch-to-kroma-popup-warning-understood-button",
                ),
              });
              this.delete();
            },
            title: msg("switch-to-kroma-popup-later-button"),
          }),
          new Button({
            tag: ".switch-button",
            click: async () => {
              await switchNetwork({ chainId: EnvironmentManager.kromaChainId });
              this.delete();
            },
            title: msg("switch-to-kroma-popup-switch-button"),
          }),
        ),
      ),
    );
  }
}
