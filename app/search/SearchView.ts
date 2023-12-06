import { el, Tabs, View } from "common-app-module";
import Layout from "../layout/Layout.js";
import SearchKrewList from "./SearchKrewList.js";
import SearchPostList from "./SearchPostList.js";
import SearchUserList from "./SearchUserList.js";

export default class SearchView extends View {
  private tabs: Tabs;
  private postList: SearchPostList;
  private krewList: SearchKrewList;
  private userList: SearchUserList;

  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".search-view",
        this.tabs = new Tabs("search", [{
          id: "post",
          label: "Post",
        }, {
          id: "krew",
          label: "Krew",
        }, {
          id: "user",
          label: "User",
        }]),
        this.postList = new SearchPostList(),
        this.krewList = new SearchKrewList(),
        this.userList = new SearchUserList(),
      ),
    );

    this.tabs.on("select", (id: string) => {
      [
        this.postList,
        this.krewList,
        this.userList,
      ].forEach((list) => list.hide());
      if (id === "post") this.postList.show();
      else if (id === "krew") this.krewList.show();
      else if (id === "user") this.userList.show();
    }).init();
  }
}
