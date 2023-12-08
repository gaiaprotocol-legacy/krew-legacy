import { msg } from "common-app-module";
import Activity from "../database-interface/Activity.js";
import ActivityList from "./ActivityList.js";
import ActivityService from "./ActivityService.js";

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

  protected async fetchActivities(): Promise<Activity[]> {
    return await ActivityService.fetchGlobalEvents();
  }
}
