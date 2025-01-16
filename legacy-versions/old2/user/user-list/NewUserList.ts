import { msg } from "@common-module/app";
import { SocialUserPublic } from "@common-module/social";
import KrewUserService from "../KrewUserService.js";
import UserList from "../user-list/UserList.js";

export default class NewUserList extends UserList {
  constructor() {
    super(".new-user-list", {
      storeName: "new-users",
      emptyMessage: msg("new-user-list-empty-message"),
    });
  }

  protected async fetchUsers(): Promise<SocialUserPublic[]> {
    return await KrewUserService.fetchNewUsers(this.lastCreatedAt);
  }
}
