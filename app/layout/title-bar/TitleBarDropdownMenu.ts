import { DropdownMenu, msg, Router } from "common-app-module";
import KrewSignedUserManager from "../../user/KrewSignedUserManager.js";

export default class TitleBarDropdownMenu extends DropdownMenu {
  constructor(options: {
    left: number;
    top: number;
  }) {
    super({
      left: options.left,
      top: options.top,
      items: [{
        title: msg("title-bar-dropdown-menu-profile-button"),
        click: () => Router.go("/profile"),
      }, {
        title: msg("title-bar-dropdown-menu-settings-button"),
        click: () => Router.go("/settings"),
      }, {
        title: msg("title-bar-dropdown-menu-logout-button"),
        click: () => KrewSignedUserManager.signOut(),
      }],
    });
  }
}
