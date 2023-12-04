import { msg } from "common-app-module";
import UserList from "../UserList.js";

export default class HolderList extends UserList {
  constructor(walletAddress: string) {
    super(".holder-list", msg("holder-list-empty-message"));
  }

  protected fetchUsers(): void {
    throw new Error("Method not implemented.");
  }
}
