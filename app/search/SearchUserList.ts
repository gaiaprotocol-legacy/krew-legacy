import { msg } from "common-app-module";
import { SoFiUserPublic } from "sofi-module";
import KrewUserService from "../user/KrewUserService.js";
import UserList from "../user/user-list/UserList.js";

export default class SearchUserList extends UserList {
  constructor(private _query: string) {
    super(".search-user-list", {
      emptyMessage: msg("search-user-list-empty-message"),
    });
  }

  public set query(query: string) {
    this._query = query;
    this.refresh();
  }

  public get query(): string {
    return this._query;
  }

  protected async fetchUsers(): Promise<SoFiUserPublic[]> {
    return await KrewUserService.findUsers(this.query);
  }
}