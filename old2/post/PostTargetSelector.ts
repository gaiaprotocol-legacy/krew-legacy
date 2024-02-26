import { DomNode, el, msg } from "@common-module/app";
import { PostTarget } from "../database-interface/KrewPost.js";

export default class PostTargetSelector extends DomNode {
  constructor() {
    super(".post-target-selector");
    this.addAllowedEvents("change");
    this.append(
      el(
        "select",
        el(
          "option",
          { value: String(PostTarget.EVERYONE) },
          msg("post-target-everyone"),
        ),
        el(
          "option",
          { value: String(PostTarget.KEY_HOLDERS) },
          msg("post-target-key-holders"),
        ),
        {
          change: (event, select) =>
            this.fireEvent(
              "change",
              Number((select.domElement as HTMLSelectElement).value),
            ),
        },
      ),
    );
  }
}
