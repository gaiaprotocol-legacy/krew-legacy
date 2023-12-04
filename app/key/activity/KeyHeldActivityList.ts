import { msg } from "common-app-module";
import KrewContractEvent from "../../database-interface/KrewContractEvent.js";
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

  protected fetchActivities(): Promise<KrewContractEvent[]> {
    throw new Error("Method not implemented.");
  }
}
