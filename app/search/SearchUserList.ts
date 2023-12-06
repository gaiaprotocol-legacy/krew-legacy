import { msg } from "common-app-module";
import { SoFiUserPublic } from "sofi-module";
import KrewUserService from "../user/KrewUserService.js";
import UserList from "../user/user-list/UserList.js";

export default class SearchUserList extends UserList {
  constructor() {
    super(".search-user-list", {
      emptyMessage: msg("search-user-list-empty-message"),
    });
  }

  protected async fetchUsers(): Promise<SoFiUserPublic[]> {
    return await KrewUserService.fetchNewUsers();
  }
}
