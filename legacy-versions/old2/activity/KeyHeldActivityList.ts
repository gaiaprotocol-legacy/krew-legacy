import { msg } from "@common-module/app";
import Activity from "../database-interface/Activity.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import ActivityList from "./ActivityList.js";
import ActivityService from "./ActivityService.js";

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

  protected async fetchActivities(): Promise<Activity[]> {
    if (KrewSignedUserManager.walletLinked) {
      return await ActivityService.fetchKeyHeldEvents(
        KrewSignedUserManager.user!.wallet_address!,
        this.lastCreatedAt,
      );
    } else {
      return [];
    }
  }
}
