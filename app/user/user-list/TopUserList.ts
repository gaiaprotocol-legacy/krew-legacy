import { msg } from "common-app-module";
import { SoFiUserPublic } from "sofi-module";
import UserList from "../user-list/UserList.js";

export default class TopUserList extends UserList {
  constructor() {
    super(".top-user-list", {
      storeName: "top-users",
      emptyMessage: msg("top-user-list-empty-message"),
    });
  }

  protected fetchUsers(): Promise<SoFiUserPublic[]> {
    throw new Error("Method not implemented.");
  }
}
