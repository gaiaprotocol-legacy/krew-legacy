import { msg } from "common-app-module";
import Krew from "../database-interface/Krew.js";
import KrewList from "./KrewList.js";
import KrewService from "./KrewService.js";

export default class TopKrewList extends KrewList {
  constructor() {
    super(".top-krew-list", {
      storeName: "top-krews",
      emptyMessage: msg("top-krew-list-empty-message"),
    });
  }

  protected async fetchKrews(): Promise<Krew[]> {
    return await KrewService.fetchTopKrews(this.lastCreatedAt);
  }
}
