import {
  Alert,
  Button,
  ButtonType,
  Component,
  el,
  ErrorAlert,
  msg,
  Popup,
} from "@common-module/app";
import Env from "../Env.js";
import WalletManager from "./WalletManager.js";

export default class SwitchToKromaPopup extends Popup {
  private resolve: (() => void) | undefined;
  private reject: (() => void) | undefined;

  private switchButton: Button;

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
              this.delete();
            },
            title: msg("switch-to-kroma-popup-later-button"),
          }),
          this.switchButton = new Button({
            tag: ".switch",
            click: async () => {
              this.switchButton.title = el(".loading-spinner");

              try {
                await WalletManager.switchToKroma();
              } catch (e) {
                this.switchButton.title = msg(
                  "switch-to-kroma-popup-switch-button",
                );
                new ErrorAlert({
                  title: msg("switch-to-kroma-popup-error-title"),
                  message: msg("switch-to-kroma-popup-error-message"),
                });
                throw new Error("Invalid network");
              }

              const chainId = await WalletManager.getChainId();
              if (!chainId) {
                this.switchButton.title = msg(
                  "switch-to-kroma-popup-switch-button",
                );
                new ErrorAlert({
                  title: msg("invalid-network-title"),
                  message: msg("invalid-network-message"),
                });
                throw new Error("Invalid network");
              }

              this.switchButton.title = msg(
                "switch-to-kroma-popup-switch-button",
              );
              if (chainId === Env.kromaChainId) {
                this.resolve?.();
                this.reject = undefined;
                this.delete();
              }
            },
            title: msg("switch-to-kroma-popup-switch-button"),
          }),
        ),
      ),
    );

    this.on("delete", () => {
      if (this.reject) this.reject();
    });
  }

  public async wait(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
