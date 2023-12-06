import { msg } from "common-app-module";
import Krew from "../database-interface/Krew.js";
import KrewList from "./KrewList.js";
import KrewService from "./KrewService.js";

export default class KeyHeldKrewList extends KrewList {
  constructor() {
    super(".key-held-krew-list", {
      storeName: "key-held-krews",
      emptyMessage: msg("key-held-krew-list-empty-message"),
    });
  }

  protected async fetchKrews(): Promise<Krew[]> {
    return await KrewService.fetchKeyHeldKrews(this.lastCreatedAt);
  }
}
