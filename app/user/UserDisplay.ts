import { DomNode } from "common-app-module";
import { SoFiUserPublic } from "sofi-module";

export default class UserDisplay extends DomNode {
  constructor(user: SoFiUserPublic) {
    super(".user-display");
  }
}
