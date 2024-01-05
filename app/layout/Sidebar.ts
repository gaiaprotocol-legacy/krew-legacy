import { DomNode, el, msg } from "@common-module/app";
import TopKrewList from "../krew/TopKrewList.js";
import TrendingKrewList from "../krew/TrendingKrewList.js";

export default class Sidebar extends DomNode {
  constructor() {
    super(".sidebar");
    this.append(
      el("h2", msg("sidebar-trending-krews-title")),
      new TrendingKrewList().show(),
      el("h2", msg("sidebar-top-krews-title")),
      new TopKrewList().show(),
    );
  }
}
