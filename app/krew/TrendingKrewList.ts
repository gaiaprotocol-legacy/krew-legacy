import { msg } from "common-app-module";
import Krew from "../database-interface/Krew.js";
import KrewList from "./KrewList.js";
import KrewService from "./KrewService.js";

export default class TrendingKrewList extends KrewList {
  constructor() {
    super(".trending-krew-list", {
      storeName: "trending-krews",
      emptyMessage: msg("trending-krew-list-empty-message"),
    });
  }

  protected async fetchKrews(): Promise<Krew[]> {
    return await KrewService.fetchTrendingKrews(this.lastCreatedAt);
  }
}
