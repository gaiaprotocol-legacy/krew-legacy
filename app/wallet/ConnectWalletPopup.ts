import {
  Button,
  ButtonType,
  Component,
  el,
  Icon,
  Popup,
} from "@common-module/app";
import FaceWalletManager from "./FaceWalletManager.js";
import WalletConnectManager from "./WalletConnectManager.js";

export default class ConnectWalletPopup extends Popup {
  private resolve: (() => void) | undefined;
  private reject: (() => void) | undefined;

  constructor() {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.connect-wallet-popup",
        el(
          "header",
          el("h1", "Connect to Kroma"),
          new Button({
            tag: ".close",
            type: ButtonType.Text,
            icon: new Icon("x"),
            click: () => this.delete(),
          }),
        ),
        el(
          "main",
          new Button({
            icon: el(
              "img",
              { src: "/images/wallet-logos/facewallet.png" },
            ),
            title: "Connect using Face Wallet",
            click: async () => {
              await FaceWalletManager.connect();
              this.resolve?.();
              this.reject = undefined;
              this.delete();
            },
          }),
          new Button({
            icon: el(
              "img",
              { src: "/images/wallet-logos/walletconnect.png" },
            ),
            title: "Connect using WalletConnect",
            click: async () => {
              await WalletConnectManager.connect();
              this.resolve?.();
              this.reject = undefined;
              this.delete();
            },
          }),
        ),
        el(
          "footer",
          new Button({
            title: "Cancel",
            click: () => this.delete(),
          }),
        ),
      ),
    );

    this.on("delete", () => this.reject?.());
  }

  public async wait(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
