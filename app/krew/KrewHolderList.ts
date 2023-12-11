import { msg } from "common-app-module";
import { SoFiUserPublic } from "sofi-module";
import KrewUserService from "../user/KrewUserService.js";
import UserList from "../user/user-list/UserList.js";

export default class KrewHolderList extends UserList {
  constructor(private krew: string) {
    super(".krew-holder-list", {
      emptyMessage: msg("krew-holder-list-empty-message"),
    });
  }

  protected async fetchUsers(): Promise<SoFiUserPublic[]> {
    return await KrewUserService.fetchKrewHolders(
      this.krew,
      this.lastCreatedAt,
    );
  }
}
