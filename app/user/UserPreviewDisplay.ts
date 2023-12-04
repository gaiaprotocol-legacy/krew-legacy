import { DomNode } from "common-app-module";
import { PreviewUserPublic } from "sofi-module";

export default class UserPreviewDisplay extends DomNode {
  constructor(user: PreviewUserPublic) {
    super(".user-display");
  }
}
