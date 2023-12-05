import { DomNode, ListLoadingBar, Store } from "common-app-module";
import { SoFiUserPublic } from "sofi-module";
import UserListItem from "./UserListItem.js";

export interface UserListOptions {
  storeName?: string;
  emptyMessage: string;
}

export default abstract class UserList extends DomNode {
  private store: Store | undefined;
  private refreshed = false;

  constructor(tag: string, options: UserListOptions) {
    super(tag + ".user-list");
    this.store = options.storeName ? new Store(options.storeName) : undefined;
    this.domElement.setAttribute("data-empty-message", options.emptyMessage);

    if (this.store) {
      const cached = this.store.get<SoFiUserPublic[]>("cached-users");
      if (cached) {
        for (const user of cached) {
          this.addUserItem(user);
        }
      }
    }
  }

  protected abstract fetchUsers(): void;

  protected addUserItem(user: SoFiUserPublic) {
    new UserListItem(user).appendTo(this);
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
