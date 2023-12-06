import { msg } from "common-app-module";
import Krew from "../database-interface/Krew.js";
import KrewList from "../krew/KrewList.js";
import KrewService from "../krew/KrewService.js";

export default class SearchKrewList extends KrewList {
  constructor() {
    super(".search-krew-list", {
      emptyMessage: msg("search-krew-list-empty-message"),
    });
  }

  protected async fetchKrews(): Promise<Krew[]> {
    return await KrewService.fetchTopKrews();
  }
}
