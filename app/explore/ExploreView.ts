import { el, Tabs, View } from "common-app-module";
import Layout from "../layout/Layout.js";
import NewUserList from "../user/user-list/NewUserList.js";
import TopUserList from "../user/user-list/TopUserList.js";
import TrendingUserList from "../user/user-list/TrendingUserList.js";

export default class ExploreView extends View {
  private tabs: Tabs;
  private trendingUserList: TrendingUserList;
  private topUserList: TopUserList;
  private newUsersList: NewUserList;

  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".explore-view",
        this.tabs = new Tabs("explore", [{
          id: "trending",
          label: "Trending",
        }, {
          id: "top",
          label: "Top",
        }, {
          id: "new",
          label: "New",
        }]),
        this.trendingUserList = new TrendingUserList(),
        this.topUserList = new TopUserList(),
        this.newUsersList = new NewUserList(),
      ),
    );

    this.tabs.on("select", (id: string) => {
      [
        this.trendingUserList,
        this.topUserList,
        this.newUsersList,
      ].forEach((list) => list.hide());
      if (id === "trending") this.trendingUserList.show();
      else if (id === "top") this.topUserList.show();
      else if (id === "new") this.newUsersList.show();
    }).init();
  }
}
