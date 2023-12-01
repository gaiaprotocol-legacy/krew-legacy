import { getNetwork, switchNetwork } from "@wagmi/core";
import {
  Alert,
  Button,
  ButtonType,
  Component,
  el,
  ErrorAlert,
  msg,
  Popup,
} from "common-app-module";
import EnvironmentManager from "../EnvironmentManager.js";

export default class SwitchToKromaPopup extends Popup {
  private resolve: (() => void) | undefined;
  private reject: (() => void) | undefined;

  constructor() {
    super({ barrierDismissible: true });
    this.append(
      new Component(
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
            tag: ".cancel",
            click: () => {
              new Alert({
                title: msg("switch-to-kroma-popup-warning-title"),
                message: msg("switch-to-kroma-popup-warning-message"),
                confirmTitle: msg(
                  "switch-to-kroma-popup-warning-understood-button",
                ),
              });
              this.reject?.();
              this.delete();
            },
            title: msg("switch-to-kroma-popup-later-button"),
          }),
          new Button({
            tag: ".switch",
            click: async () => {
              await switchNetwork({ chainId: EnvironmentManager.kromaChainId });

              const { chain } = getNetwork();
              if (!chain) {
                new ErrorAlert({
                  title: msg("invalid-network-title"),
                  message: msg("invalid-network-message"),
                });
                throw new Error("Invalid network");
              }

              if (chain.id === EnvironmentManager.kromaChainId) {
                this.resolve?.();
                this.delete();
              }
            },
            title: msg("switch-to-kroma-popup-switch-button"),
          }),
        ),
      ),
    );
  }

  public async wait(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
