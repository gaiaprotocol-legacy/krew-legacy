import { msg } from "@common-module/app";
import Krew from "../database-interface/Krew.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import KrewList from "./KrewList.js";
import KrewService from "./KrewService.js";

export default class OwnedKrewList extends KrewList {
  constructor() {
    super(".owned-krew-list", {
      storeName: "owned-krews",
      emptyMessage: msg("owned-krew-list-empty-message"),
    });
  }

  protected async fetchKrews(): Promise<Krew[]> {
    if (KrewSignedUserManager.user?.wallet_address) {
      return await KrewService.fetchOwnedKrews(
        KrewSignedUserManager.user.wallet_address,
        this.lastCreatedAt,
      );
    } else {
      return [];
    }
  }
}
