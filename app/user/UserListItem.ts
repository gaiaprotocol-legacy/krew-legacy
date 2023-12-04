import { DomNode, UserPublic } from "common-app-module";

export default class UserListItem extends DomNode {
  constructor(private userPublic: UserPublic) {
    super(".user-list-item");
  }
}
