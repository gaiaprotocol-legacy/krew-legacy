import { el, msg, Tabs, View } from "@common-module/app";
import NewKrewList from "../krew/NewKrewList.js";
import TopKrewList from "../krew/TopKrewList.js";
import TrendingKrewList from "../krew/TrendingKrewList.js";
import Layout from "../layout/Layout.js";

export default class ExploreView extends View {
  private tabs: Tabs;
  private trendingKrewList: TrendingKrewList;
  private topKrewList: TopKrewList;
  private newKrewList: NewKrewList;

  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".explore-view",
        el(
          "main",
          this.tabs = new Tabs("explore", [{
            id: "trending",
            label: msg("explore-view-trending-tab"),
          }, {
            id: "top",
            label: msg("explore-view-top-tab"),
          }, {
            id: "new",
            label: msg("explore-view-new-tab"),
          }]),
          this.trendingKrewList = new TrendingKrewList(),
          this.topKrewList = new TopKrewList(),
          this.newKrewList = new NewKrewList(),
        ),
      ),
    );

    this.tabs.on("select", (id: string) => {
      [
        this.trendingKrewList,
        this.topKrewList,
        this.newKrewList,
      ].forEach((list) => list.hide());
      if (id === "trending") this.trendingKrewList.show();
      else if (id === "top") this.topKrewList.show();
      else if (id === "new") this.newKrewList.show();
    }).init();
  }
}
