import {
  BrowserInfo,
  Button,
  DomNode,
  el,
  msg,
  Router,
} from "@common-module/app";
import MaterialIcon from "../MaterialIcon.js";
import NotificationsPanel from "../notification/NotificationsPanel.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import TitleBarDropdownMenu from "./title-bar/TitleBarDropdownMenu.js";
import TitleBarSearchForm from "./title-bar/TitleBarSearchForm.js";
import TitleBarUserDisplay from "./title-bar/TitleBarUserDisplay.js";

export default class TitleBar extends DomNode {
  private searchForm: TitleBarSearchForm;

  constructor() {
    super(".title-bar");
    this.append(
      el("h1", el("img", { src: "/images/logo.png" }), {
        click: () => Router.go("/"),
      }),
      this.searchForm = new TitleBarSearchForm(),
      ...KrewSignedUserManager.signed
        ? [
          el("button.noti", new MaterialIcon("notifications"), {
            click: (event) => {
              event.stopPropagation();
              BrowserInfo.isPhoneSize
                ? Router.go("/notifications")
                : new NotificationsPanel();
            },
          }),
          new TitleBarUserDisplay(KrewSignedUserManager.user!),
        ]
        : [
          new Button({
            tag: ".sign-in",
            title: msg("title-bar-sign-in-button"),
            click: () => KrewSignedUserManager.signIn(),
          }),
          el("button.menu", new MaterialIcon("menu"), {
            click: (event) => {
              event.stopPropagation();
              const rect = this.rect;
              new TitleBarDropdownMenu({
                left: rect.right - (BrowserInfo.isPhoneSize ? 172 : 215),
                top: rect.bottom - 8,
              });
            },
          }),
        ],
    );
  }

  public clearSearchForm() {
    this.searchForm.clear();
  }
}
