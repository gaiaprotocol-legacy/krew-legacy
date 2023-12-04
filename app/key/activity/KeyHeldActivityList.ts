import { msg } from "common-app-module";
import KrewContractEvent from "../../database-interface/KrewContractEvent.js";
import KrewSignedUserManager from "../../user/KrewSignedUserManager.js";
import KrewContractEventService from "../KrewContractEventService.js";
import ActivityList from "./ActivityList.js";

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
