import { msg } from "common-app-module";
import { SoFiUserPublic } from "sofi-module";
import UserList from "../user-list/UserList.js";

export default class FollowingList extends UserList {
  constructor(userId: string) {
    super(".following-list", {
      emptyMessage: msg("following-list-empty-message"),
    });
  }

  protected fetchUsers(): Promise<SoFiUserPublic[]> {
    throw new Error("Method not implemented.");
  }
}
