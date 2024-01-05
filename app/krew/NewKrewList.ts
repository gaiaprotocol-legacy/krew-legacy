import { msg } from "@common-module/app";
import Krew from "../database-interface/Krew.js";
import KrewList from "./KrewList.js";
import KrewService from "./KrewService.js";

export default class NewKrewList extends KrewList {
  constructor() {
    super(".new-krew-list", {
      storeName: "new-krews",
      emptyMessage: msg("new-krew-list-empty-message"),
    });
  }

  protected async fetchKrews(): Promise<Krew[]> {
    return await KrewService.fetchNewKrews(this.lastCreatedAt);
  }
}
