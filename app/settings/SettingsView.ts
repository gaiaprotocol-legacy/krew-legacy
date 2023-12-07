import { DomNode, el, msg, Router, View, ViewParams } from "common-app-module";
import Layout from "../layout/Layout.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";

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
          el(
            "section.x",
            el("h2", msg("settings-view-x-section-title")),
            el(
              ".profile-image-wrapper",
              el(".profile-image", {
                style: { backgroundImage: "url(/images/icon-512x512.png)" },
              }),
            ),
            el(
              "h3",
              el(
                "a",
                "@krew_social",
                {
                  href: "https://x.com/krew_social",
                  target: "_blank",
                },
              ),
            ),
            el(
              ".socials",
              el(
                "a",
                "𝕏",
                {
                  href: "https://x.com/krew_social",
                  target: "_blank",
                },
              ),
            ),
          ),
          el(
            "section.actions",
            !KrewSignedUserManager.signed
              ? undefined
              : this.linkWalletSection = el("section.link-wallet"),
            !KrewSignedUserManager.signed
              ? el(
                "section.login",
                el("h2", msg("settings-view-login-section-title")),
                el("p", msg("settings-view-login-section-description")),
                el("button", msg("settings-view-login-button"), {
                  click: () => KrewSignedUserManager.signIn(),
                }),
              )
              : el(
                "section.logout",
                el("h2", msg("settings-view-logout-section-title")),
                el("p", msg("settings-view-logout-section-description")),
                el("button", msg("settings-view-logout-button"), {
                  click: () => KrewSignedUserManager.signOut(),
                }),
              ),
          ),
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
      KrewSignedUserManager.walletLinked
        ? el(
          "p.linked",
          msg("settings-view-link-wallet-section-linked") + " ",
          el("a", KrewSignedUserManager.user?.wallet_address, {
            href:
              `https://kromascan.com/address/${KrewSignedUserManager.user?.wallet_address}`,
            target: "_blank",
          }),
        )
        : el("p", msg("settings-view-link-wallet-section-description")),
      el("button", msg("settings-view-link-wallet-button"), {
        click: () => KrewSignedUserManager.linkWallet(),
      }),
    );
  }
}
