import { msg } from "common-app-module";
import UserList from "../user-list/UserList.js";

export default class TopUserList extends UserList {
  constructor() {
    super(".top-user-list", {
      storeName: "top-users",
      emptyMessage: msg("top-user-list-empty-message"),
    });
  }

  protected fetchUsers(): void {
    throw new Error("Method not implemented.");
  }
}
