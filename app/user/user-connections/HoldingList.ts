import { msg } from "common-app-module";
import { SoFiUserPublic } from "sofi-module";
import UserList from "../user-list/UserList.js";

export default class HoldingList extends UserList {
  constructor(walletAddress: string) {
    super(".holding-list", {
      emptyMessage: msg("holding-list-empty-message"),
    });
  }

  protected fetchUsers(): Promise<SoFiUserPublic[]> {
    throw new Error("Method not implemented.");
  }
}
