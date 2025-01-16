import { msg } from "@common-module/app";
import Krew from "../../database-interface/Krew.js";
import KrewList from "../../krew/KrewList.js";
import KrewService from "../../krew/KrewService.js";

export default class HoldingList extends KrewList {
  constructor(private walletAddress: string | undefined) {
    super(".holding-list", {
      emptyMessage: msg("holding-list-empty-message"),
    });
  }

  protected async fetchKrews(): Promise<Krew[]> {
    if (this.walletAddress) {
      return await KrewService.fetchKeyHeldKrews(
        this.walletAddress,
        this.lastCreatedAt,
      );
    } else {
      return [];
    }
  }
}
