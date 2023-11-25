import { DomNode, el, Router } from "common-app-module";

export default class TitleBar extends DomNode {
  constructor() {
    super(".title-bar");
    this.append(
      el("h1", el("img", { src: "/images/logo.png" }), {
        click: () => Router.go("/"),
      }),
    );
  }
}
