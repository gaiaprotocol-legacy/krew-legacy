import { el, Tabs, View } from "common-app-module";
import Layout from "../layout/Layout.js";
import NewUserList from "../user/user-list/NewUserList.js";
import TopUserList from "../user/user-list/TopUserList.js";

export default class ExploreView extends View {
  private tabs: Tabs;
  private topUserList: TopUserList;
  private newUsersList: NewUserList;

  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".explore-view",
        this.tabs = new Tabs("explore", [{
          id: "top",
          label: "Top",
        }, {
          id: "new",
          label: "New",
        }]),
        this.topUserList = new TopUserList(),
        this.newUsersList = new NewUserList(),
      ),
    );

    this.tabs.on("select", (id: string) => {
      [
        this.topUserList,
        this.newUsersList,
      ].forEach((list) => list.hide());
      if (id === "top") this.topUserList.show();
      else if (id === "new") this.newUsersList.show();
    }).init();
  }
}
