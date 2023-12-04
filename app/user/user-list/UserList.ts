import { DomNode, ListLoadingBar, Store } from "common-app-module";
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

  private async refresh() {
    this.append(new ListLoadingBar());

    //TODO:

    if (!this.deleted) {
      this.refreshed = true;
    }
  }

  public show() {
    this.deleteClass("hidden");
    if (!this.refreshed) this.refresh();
  }

  public hide() {
    this.addClass("hidden");
  }
}
