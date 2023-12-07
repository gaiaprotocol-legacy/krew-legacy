import { msg } from "common-app-module";
import Krew from "../database-interface/Krew.js";
import KrewList from "../krew/KrewList.js";
import KrewService from "../krew/KrewService.js";

export default class SearchKrewList extends KrewList {
  constructor(private _query: string) {
    super(".search-krew-list", {
      emptyMessage: msg("search-krew-list-empty-message"),
    });
  }

  public set query(query: string) {
    this._query = query;
    this.lastCreatedAt = undefined;
    this.refresh();
  }

  public get query(): string {
    return this._query;
  }

  protected async fetchKrews(): Promise<Krew[]> {
    return await KrewService.findKrews(this.query, this.lastCreatedAt);
  }
}
