import { msg } from "common-app-module";
import Krew from "../../database-interface/Krew.js";
import KrewList from "../../krew/KrewList.js";
import KrewService from "../../krew/KrewService.js";

export default class HoldingList extends KrewList {
  constructor(private walletAddress: string) {
    super(".holding-list", {
      emptyMessage: msg("holding-list-empty-message"),
    });
  }

  protected async fetchKrews(): Promise<Krew[]> {
    return await KrewService.fetchKeyHeldKrews(
      this.walletAddress,
      this.lastCreatedAt,
    );
  }
}
