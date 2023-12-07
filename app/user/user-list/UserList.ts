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
  protected lastCreatedAt: string | undefined;

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

  protected abstract fetchUsers(): Promise<SoFiUserPublic[]>;

  protected addUserItem(user: SoFiUserPublic) {
    new UserListItem(user).appendTo(this);
  }

  protected async refresh() {
    this.append(new ListLoadingBar());

    const users = await this.fetchUsers();
    this.store?.set("cached-users", users, true);

    if (!this.deleted) {
      this.empty();
      for (const user of users) {
        this.addUserItem(user);
      }
      this.lastCreatedAt = users[users.length - 1]?.created_at;
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
