import { msg } from "common-app-module";
import UserList from "../user-list/UserList.js";

export default class FollowerList extends UserList {
  constructor(userId: string) {
    super(".follower-list", {
      emptyMessage: msg("follower-list-empty-message"),
    });
  }

  protected fetchUsers(): void {
    throw new Error("Method not implemented.");
  }
}
