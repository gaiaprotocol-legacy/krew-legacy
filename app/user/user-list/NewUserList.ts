import { msg } from "common-app-module";
import UserList from "../user-list/UserList.js";

export default class NewUserList extends UserList {
  constructor() {
    super(".new-user-list", {
      storeName: "new-users",
      emptyMessage: msg("new-user-list-empty-message"),
    });
  }

  protected fetchUsers(): void {
    throw new Error("Method not implemented.");
  }
}
