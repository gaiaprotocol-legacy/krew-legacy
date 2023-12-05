import { msg } from "common-app-module";
import { SoFiUserPublic } from "sofi-module";
import UserList from "../user-list/UserList.js";

export default class TrendingUserList extends UserList {
  constructor() {
    super(".trending-user-list", {
      storeName: "trending-users",
      emptyMessage: msg("trending-user-list-empty-message"),
    });
  }

  protected fetchUsers(): Promise<SoFiUserPublic[]> {
    throw new Error("Method not implemented.");
  }
}
