import { msg } from "common-app-module";
import KrewContractEvent from "../../database-interface/KrewContractEvent.js";
import KrewContractEventService from "../KrewContractEventService.js";
import ActivityList from "./ActivityList.js";

export default class GlobalActivityList extends ActivityList {
  constructor() {
    super(
      ".global-activity-list",
      {
        storeName: "global-activities",
        emptyMessage: msg("global-activity-list-empty-message"),
      },
    );
  }

  protected async fetchActivities(): Promise<KrewContractEvent[]> {
    return await KrewContractEventService.fetchGlobalEvents();
  }
}