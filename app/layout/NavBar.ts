import { DomNode, el, Router } from "common-app-module";
import MaterialIcon from "../MaterialIcon.js";

export default class NavBar extends DomNode {
  private activatedButton: DomNode | undefined;

  constructor() {
    super(".nav-bar");
    this.append(
      el("h1", el("img", { src: "/images/logo.png" }), {
        click: () => Router.go("/"),
      }),
      el("button.home.active", new MaterialIcon("home"), {
        click: () => Router.go("/"),
      }),
    );
  }

  public activeButton(buttonName: string) {
    this.activatedButton?.deleteClass("active");
    this.activatedButton = this.children.find((child) =>
      child.hasClass(buttonName)
    )?.addClass("active");
  }
}
