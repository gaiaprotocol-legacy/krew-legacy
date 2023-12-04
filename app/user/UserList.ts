import { DomNode, Store } from "common-app-module";
import { SoFiUserPublic } from "sofi-module";
import UserListItem from "./UserListItem.js";

export default abstract class UserList extends DomNode {
  private store: Store | undefined;
  private refreshed = false;

  constructor(tag: string, emptyMessage: string) {
    super(tag + ".user-list");
    this.domElement.setAttribute("data-empty-message", emptyMessage);
  }

  protected abstract fetchUsers(): void;

  protected addUserItem(userPublic: SoFiUserPublic) {
    new UserListItem(userPublic).appendTo(this);
  }
}
