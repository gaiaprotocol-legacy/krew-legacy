import { msg } from "common-app-module";
import KrewContractEvent from "../database-interface/KrewContractEvent.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import ActivityList from "./ActivityList.js";
import KrewContractEventService from "./KrewContractEventService.js";

export default class KeyHeldActivityList extends ActivityList {
  constructor() {
    super(
      ".key-held-activity-list",
      {
        storeName: "key-held-activities",
        emptyMessage: msg("key-held-activity-list-empty-message"),
      },
    );
  }

  protected async fetchActivities(): Promise<KrewContractEvent[]> {
    return [];

    if (KrewSignedUserManager.walletLinked) {
      return await KrewContractEventService.fetchKeyHeldEvents(
        KrewSignedUserManager.user!.wallet_address!,
        this.lastCreatedAt,
      );
    } else {
      return [];
    }
  }
}
