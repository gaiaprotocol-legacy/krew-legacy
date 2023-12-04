import { DomNode } from "common-app-module";
import { SoFiUserPublic } from "sofi-module";

export default class UserListItem extends DomNode {
  constructor(private user: SoFiUserPublic) {
    super(".user-list-item");
  }
}
