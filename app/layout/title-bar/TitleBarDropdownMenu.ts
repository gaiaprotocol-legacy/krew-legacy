import { DropdownMenu, el, msg, Router } from "common-app-module";
import KrewSignedUserManager from "../../user/KrewSignedUserManager.js";
import MaterialIcon from "../../MaterialIcon.js";

export default class TitleBarDropdownMenu extends DropdownMenu {
  constructor(options: {
    left: number;
    top: number;
  }) {
    super({
      left: options.left,
      top: options.top,
      items: KrewSignedUserManager.signed
        ? [{
          title: msg("title-bar-dropdown-menu-profile-button"),
          click: () => Router.go("/profile"),
        }, {
          title: msg("title-bar-dropdown-menu-my-krews-button"),
          click: () => Router.go("/my-krews"),
        }, {
          title: msg("title-bar-dropdown-menu-settings-button"),
          click: () => Router.go("/settings"),
        }, {
          title: msg("title-bar-dropdown-menu-logout-button"),
          click: () => KrewSignedUserManager.signOut(),
        }]
        : [{
          title: msg("title-bar-dropdown-menu-settings-button"),
          click: () => Router.go("/settings"),
        }],
      footer: el(
        "footer.social",
        el("a", el("img", { src: "/images/social/discord.svg" }), {
          href: "https://discord.gg/p2VhZAjyzP",
          target: "_blank",
        }),
        el("a", el("img", { src: "/images/social/telegram.svg" }), {
          href: "https://t.me/krew_social",
          target: "_blank",
        }),
        el("a", el("img", { src: "/images/social/x.svg" }), {
          href: "https://x.com/krew_social",
          target: "_blank",
        }),
      ),
    });
  }
}
