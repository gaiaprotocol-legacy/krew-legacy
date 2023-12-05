import { msg } from "common-app-module";
import UserList from "../user-list/UserList.js";

export default class TrendingUserList extends UserList {
  constructor() {
    super(".trending-user-list", {
      storeName: "trending-users",
      emptyMessage: msg("trending-user-list-empty-message"),
    });
  }

  protected fetchUsers(): void {
    throw new Error("Method not implemented.");
  }
}
