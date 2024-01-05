import { DomNode, el } from "@common-module/app";
import { AuthorUtil, SoFiUserPublic } from "@common-module/social";
import MaterialIcon from "../../MaterialIcon.js";
import TitleBarDropdownMenu from "./TitleBarDropdownMenu.js";

export default class TitleBarUserDisplay extends DomNode {
  constructor(user: SoFiUserPublic) {
    super(".title-bar-user-display");

    const profileImage = el(".profile-image");

    AuthorUtil.selectLoadableProfileImage(profileImage, [
      user.profile_image_thumbnail,
      user.stored_profile_image_thumbnail,
    ]);

    this.append(
      profileImage,
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
