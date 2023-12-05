import { DomNode, ListLoadingBar, Store } from "common-app-module";
import KrewContractEvent from "../database-interface/KrewContractEvent.js";
import ActivityListItem from "./ActivityListItem.js";

export interface ActivityListOptions {
  storeName: string;
  emptyMessage: string;
}

export default abstract class ActivityList extends DomNode {
  protected store: Store;
  protected lastCreatedAt: string | undefined;
  private refreshed = false;

  constructor(tag: string, options: ActivityListOptions) {
    super(tag + ".activity-list");
    this.store = new Store(options.storeName);
    this.domElement.setAttribute("data-empty-message", options.emptyMessage);

    const cachedEvents = this.store.get<KrewContractEvent[]>("cached-events");
    if (cachedEvents && cachedEvents.length > 0) {
      for (const e of cachedEvents) {
        this.append(new ActivityListItem(e));
      }
    }
  }

  protected abstract fetchActivities(): Promise<KrewContractEvent[]>;

  private async refresh() {
    this.append(new ListLoadingBar());

    const events = await this.fetchActivities();
    this.store.set("cached-events", events, true);

    if (!this.deleted) {
      this.empty();
      for (const e of events) {
        this.append(new ActivityListItem(e));
      }
      this.lastCreatedAt = events[events.length - 1]?.created_at;
      this.refreshed = true;
    }
  }

  public show() {
    this.deleteClass("hidden");
    if (!this.refreshed) this.refresh();
  }

  public hide() {
    this.addClass("hidden");
  }
}
