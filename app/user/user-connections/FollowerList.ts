import { msg } from "@common-module/app";
import { SoFiUserPublic } from "sofi-module";
import KrewUserService from "../KrewUserService.js";
import UserList from "../user-list/UserList.js";

export default class FollowerList extends UserList {
  private lastFetchedFollowedAt: string | undefined;

  constructor(private userId: string) {
    super(".follower-list", {
      emptyMessage: msg("follower-list-empty-message"),
    });
  }

  protected async fetchUsers(): Promise<SoFiUserPublic[]> {
    const result = await KrewUserService.fetchFollowers(
      this.userId,
      this.lastFetchedFollowedAt,
    );
    this.lastFetchedFollowedAt = result.lastFetchedFollowedAt;
    return result.users;
  }
}
