import { Button, DomNode, el, msg, View, ViewParams } from "@common-module/app";
import Layout from "../layout/Layout.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import WalletManager from "../wallet/WalletManager.js";

export default class SettingsView extends View {
  private linkWalletSection: DomNode | undefined;

  constructor(params: ViewParams) {
    super();
    Layout.append(
      this.container = el(
        ".settings-view",
        el("h1", msg("settings-view-title")),
        el(
          "main",
          !KrewSignedUserManager.signed
            ? undefined
            : this.linkWalletSection = el("section.link-wallet"),
        ),
      ),
    );

    this.renderLinkWalletSection();
    this.container.onDelegate(
      KrewSignedUserManager,
      "walletLinked",
      () => this.renderLinkWalletSection(),
    );
  }

  private renderLinkWalletSection() {
    this.linkWalletSection?.empty().append(
      el("h2", msg("settings-view-link-wallet-section-title")),
      el(
        "main",
        KrewSignedUserManager.walletLinked
          ? el(
            "p.linked",
            msg("settings-view-link-wallet-section-linked").trim() + " ",
            el("a", KrewSignedUserManager.user?.wallet_address, {
              href:
                `https://kromascan.com/address/${KrewSignedUserManager.user?.wallet_address}`,
              target: "_blank",
            }),
          )
          : el("p", msg("settings-view-link-wallet-section-description")),
      ),
      el(
        "footer",
        /*new Button({
          title: "Connect Wallet",
          click: async () => await WalletManager.connect(),
        }),*/
        new Button({
          title: msg("settings-view-link-wallet-button"),
          click: async (event, button) => {
            button.domElement.setAttribute("disabled", "disabled");
            button.text = msg("no-wallet-linked-linking");
            try {
              await KrewSignedUserManager.linkWallet();
              this.renderLinkWalletSection();
            } catch (e) {
              console.error(e);
              button.domElement.removeAttribute("disabled");
              button.text = msg("settings-view-link-wallet-button");
            }
          },
        }),
      ),
    );
  }
}
