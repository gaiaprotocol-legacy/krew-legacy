import { el, Tabs, View } from "common-app-module";
import Layout from "../layout/Layout.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import GlobalActivityList from "./activity/GlobalActivityList.js";
import KeyHeldActivityList from "./activity/KeyHeldActivityList.js";

export default class KeysView extends View {
  private tabs: Tabs;
  private globalActivityList: GlobalActivityList;
  private keyHeldActivityList: KeyHeldActivityList | undefined;

  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".keys-view",
        this.tabs = new Tabs(
          "activity-list-tabs",
          KrewSignedUserManager.walletLinked
            ? [
              { id: "global", label: "Global" },
              { id: "held", label: "Held" },
            ]
            : [
              { id: "global", label: "Global" },
            ],
        ),
        this.globalActivityList = new GlobalActivityList(),
        this.keyHeldActivityList = KrewSignedUserManager.walletLinked
          ? new KeyHeldActivityList()
          : undefined,
      ),
    );

    this.tabs.on("select", (id: string) => {
      [this.globalActivityList, this.keyHeldActivityList]
        .forEach((list) => list?.hide());
      if (id === "global") this.globalActivityList.show();
      else if (id === "held") this.keyHeldActivityList?.show();
    }).init();
  }
}