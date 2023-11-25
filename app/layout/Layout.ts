import { BodyNode, DomNode, el, View, ViewParams } from "common-app-module";
import NavBar from "./NavBar.js";
import Sidebar from "./Sidebar.js";
import TitleBar from "./TitleBar.js";

export default class Layout extends View {
  private static current: Layout;

  public static append(node: DomNode): void {
    Layout.current.content.append(node);
  }

  private titleBar: TitleBar;
  private navBar: NavBar;
  private content: DomNode;

  constructor(params: ViewParams, uri: string) {
    super();
    Layout.current = this;

    BodyNode.append(
      this.container = el(
        ".layout",
        this.titleBar = new TitleBar(),
        el(
          "main",
          this.navBar = new NavBar(),
          this.content = el("section.content"),
          new Sidebar(),
        ),
      ),
    );

    this.changeUri(uri);
  }

  public changeParams(params: ViewParams, uri: string): void {
    this.changeUri(uri);
  }

  private changeUri(uri: string): void {
    this.navBar.activeButton(
      uri === "" ? "posts" : uri.substring(
        0,
        uri.indexOf("/") === -1 ? uri.length : uri.indexOf("/"),
      ),
    );
    if (uri !== "search") this.titleBar.clearSearchForm();
  }
}
