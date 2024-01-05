import { msg } from "@common-module/app";
import ActivityList from "../activity/ActivityList.js";
import ActivityService from "../activity/ActivityService.js";
import Activity from "../database-interface/Activity.js";

export default class KrewActivityList extends ActivityList {
  constructor(private krew: string) {
    super(
      ".krew-activity-list",
      { emptyMessage: msg("krew-activity-list-empty-message") },
    );
  }

  protected async fetchActivities(): Promise<Activity[]> {
    return await ActivityService.fetchKrewActivities(
      this.krew,
      this.lastCreatedAt,
    );
  }
}
