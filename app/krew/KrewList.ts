import { DomNode, ListLoadingBar, Store } from "common-app-module";
import Krew from "../database-interface/Krew.js";
import KrewListItem from "./KrewListItem.js";

export interface KrewListOptions {
  storeName?: string;
  emptyMessage: string;
}

export default abstract class KrewList extends DomNode {
  private store: Store | undefined;
  private refreshed = false;
  protected lastCreatedAt: string | undefined;

  constructor(tag: string, options: KrewListOptions) {
    super(tag + ".krew-list");
    this.store = options.storeName ? new Store(options.storeName) : undefined;
    this.domElement.setAttribute("data-empty-message", options.emptyMessage);

    if (this.store) {
      const cached = this.store.get<Krew[]>("cached-krews");
      if (cached) {
        for (const krew of cached) {
          this.addKrewItem(krew);
        }
      }
    }
  }

  protected abstract fetchKrews(): Promise<Krew[]>;

  protected addKrewItem(krew: Krew) {
    new KrewListItem(krew).appendTo(this);
  }

  protected async refresh() {
    this.append(new ListLoadingBar());

    const krews = await this.fetchKrews();
    this.store?.set("cached-krews", krews, true);

    if (!this.deleted) {
      this.empty();
      for (const krew of krews) {
        this.addKrewItem(krew);
      }
      this.lastCreatedAt = krews[krews.length - 1]?.created_at;
      this.refreshed = true;
    }
  }

  public show() {
    this.deleteClass("hidden");
    if (!this.refreshed) this.refresh();
    return this;
  }

  public hide() {
    this.addClass("hidden");
  }
}
