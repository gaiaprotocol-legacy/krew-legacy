import { el, msg, Tabs, View } from "common-app-module";
import KeyHeldKrewList from "../krew/KeyHeldKrewList.js";
import Layout from "../layout/Layout.js";
import OwnedKrewList from "./OwnedKrewList.js";

export default class MyKrewsView extends View {
  private tabs: Tabs;
  private ownedKrewList: OwnedKrewList;
  private keyHeldKrewList: KeyHeldKrewList;

  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".my-krews-view",
        el(
          "main",
          this.tabs = new Tabs("my-krews", [{
            id: "owned",
            label: msg("my-krews-view-owned-tab"),
          }, {
            id: "key-held",
            label: msg("my-krews-view-key-held-tab"),
          }]),
          this.ownedKrewList = new OwnedKrewList(),
          this.keyHeldKrewList = new KeyHeldKrewList(),
        ),
      ),
    );

    this.tabs.on("select", (id: string) => {
      [
        this.ownedKrewList,
        this.keyHeldKrewList,
      ].forEach((list) => list.hide());
      if (id === "owned") this.ownedKrewList.show();
      else if (id === "key-held") this.keyHeldKrewList.show();
    }).init();
  }
}
