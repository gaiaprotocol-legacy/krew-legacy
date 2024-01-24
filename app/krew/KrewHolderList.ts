import { msg } from "@common-module/app";
import { SocialUserPublic } from "@common-module/social";
import KrewUserService from "../user/KrewUserService.js";
import UserList from "../user/user-list/UserList.js";

export default class KrewHolderList extends UserList {
  constructor(private krew: string) {
    super(".krew-holder-list", {
      emptyMessage: msg("krew-holder-list-empty-message"),
    });
  }

  protected async fetchUsers(): Promise<SocialUserPublic[]> {
    return await KrewUserService.fetchKrewHolders(
      this.krew,
      this.lastCreatedAt,
    );
  }
}
