import { msg } from "@common-module/app";
import { SoFiUserPublic } from "@common-module/social";
import KrewUserService from "../KrewUserService.js";
import UserList from "../user-list/UserList.js";

export default class FollowingList extends UserList {
  private lastFetchedFollowedAt: string | undefined;

  constructor(private userId: string) {
    super(".following-list", {
      emptyMessage: msg("following-list-empty-message"),
    });
  }

  protected async fetchUsers(): Promise<SoFiUserPublic[]> {
    const result = await KrewUserService.fetchFollowingUsers(
      this.userId,
      this.lastFetchedFollowedAt,
    );
    this.lastFetchedFollowedAt = result.lastFetchedFollowedAt;
    return result.users;
  }
}
