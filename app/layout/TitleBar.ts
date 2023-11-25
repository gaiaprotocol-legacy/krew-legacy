import { DomNode, el, Router } from "common-app-module";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";

export default class TitleBar extends DomNode {
  constructor() {
    super(".title-bar");
    this.append(
      el("h1", el("img", { src: "/images/logo.png" }), {
        click: () => Router.go("/"),
      }),
      KrewSignedUserManager.signed ? el("") : el(""),
    );
  }
}
