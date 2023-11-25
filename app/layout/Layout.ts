import { BodyNode, DomNode, el, View } from "common-app-module";
import NavBar from "./NavBar.js";

export default class Layout extends View {
  private static current: Layout;

  public static append(node: DomNode): void {
    Layout.current.content.append(node);
  }

  private navBar: NavBar;
  private content: DomNode;

  constructor() {
    super();
    Layout.current = this;

    BodyNode.append(
      this.container = el(
        ".layout",
        this.navBar = new NavBar(),
        this.content = el("main"),
      ),
    );
  }
}
