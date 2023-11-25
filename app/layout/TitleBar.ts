import { Button, DomNode, el, msg, Router } from "common-app-module";
import MaterialIcon from "../MaterialIcon.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
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
          el("button.noti", new MaterialIcon("notifications")),
          new TitleBarUserDisplay(KrewSignedUserManager.user!),
        ]
        : [
          new Button({
            tag: ".sign-in",
            title: msg("title-bar-sign-in-button"),
            click: () => KrewSignedUserManager.signIn(),
          }),
        ],
    );
  }

  public clearSearchForm() {
    this.searchForm.clear();
  }
}
