import { msg } from "common-app-module";
import Krew from "../../database-interface/Krew.js";
import KrewList from "../../krew/KrewList.js";

export default class HoldingList extends KrewList {
  constructor(private walletAddress: string) {
    super(".holding-list", {
      emptyMessage: msg("holding-list-empty-message"),
    });
  }

  protected async fetchKrews(): Promise<Krew[]> {
    throw new Error("Method not implemented.");
  }
}
