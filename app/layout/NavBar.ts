import { DomNode, el, Router } from "common-app-module";
import MaterialIcon from "../MaterialIcon.js";

export default class NavBar extends DomNode {
  private activatedButton: DomNode | undefined;

  constructor() {
    super(".nav-bar");
    this.append(
      el("button.posts", new MaterialIcon("globe"), {
        click: () => Router.go("/"),
      }),
      el("button.chats", new MaterialIcon("chat"), {
        click: () => Router.go("/chats"),
      }),
      el("button.keys", new MaterialIcon("key"), {
        click: () => Router.go("/keys"),
      }),
      el("button.explore", new MaterialIcon("search"), {
        click: () => Router.go("/explore"),
      }),
      el("button.add", new MaterialIcon("add"), {
        //TODO:
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
