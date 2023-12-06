import { DomNode, el } from "common-app-module";
import TopKrewList from "../krew/TopKrewList.js";
import TrendingKrewList from "../krew/TrendingKrewList.js";

export default class Sidebar extends DomNode {
  constructor() {
    super(".sidebar");
    this.append(
      el("h2", "Trending Krews"),
      new TrendingKrewList().show(),
      el("h2", "Top Krews"),
      new TopKrewList().show(),
    );
  }
}
