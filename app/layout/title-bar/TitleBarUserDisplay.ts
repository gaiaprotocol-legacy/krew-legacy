import { DomNode, el } from "common-app-module";
import { SoFiUserPublic } from "sofi-module";
import MaterialIcon from "../../MaterialIcon.js";
import TitleBarDropdownMenu from "./TitleBarDropdownMenu.js";

export default class TitleBarUserDisplay extends DomNode {
  constructor(user: SoFiUserPublic) {
    super(".title-bar-user-display");

    this.append(
      el(".profile-image", {
        style: { backgroundImage: `url(${user.profile_image_thumbnail})` },
      }),
      el(".name", user.display_name),
      el("button.dropdown", new MaterialIcon("arrow_drop_down")),
    );

    this.onDom("click", (event) => {
      event.stopPropagation();
      const rect = this.rect;
      new TitleBarDropdownMenu({
        left: rect.right - 160,
        top: rect.bottom + 10,
      });
    });
  }
}
