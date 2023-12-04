import { msg } from "common-app-module";
import KrewContractEvent from "../../database-interface/KrewContractEvent.js";
import ActivityList from "./ActivityList.js";

export default class YourKeysActivityList extends ActivityList {
  constructor() {
    super(
      ".your-keys-activity-list",
      {
        storeName: "your-keys-activities",
        emptyMessage: msg("your-keys-activity-list-empty-message"),
      },
    );
  }

  protected fetchActivities(): Promise<KrewContractEvent[]> {
    throw new Error("Method not implemented.");
  }
}
