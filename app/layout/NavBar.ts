import { DomNode, el, Router } from "common-app-module";
import CreateKrewPopup from "../krew/CreateKrewPopup.js";
import MaterialIcon from "../MaterialIcon.js";
import AddPopup from "./AddPopup.js";

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
      el("button.explore", new MaterialIcon("explore"), {
        click: () => Router.go("/explore"),
      }),
      el("button.activity", new MaterialIcon("browse_activity"), {
        click: () => Router.go("/activity"),
      }),
      el("button.add", new MaterialIcon("add"), {
        click: () => new AddPopup(),
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
