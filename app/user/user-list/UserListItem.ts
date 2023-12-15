import { DomNode, el, Router } from "common-app-module";
import { AuthorUtil, SoFiUserPublic } from "sofi-module";

export default class UserListItem extends DomNode {
  constructor(user: SoFiUserPublic) {
    super(".user-list-item");

    const profileImage = el(".profile-image");

    AuthorUtil.selectLoadableProfileImage(profileImage, [
      user.profile_image_thumbnail,
      user.stored_profile_image_thumbnail,
    ]);

    this.append(
      el(
        ".info",
        profileImage,
        el(".name", user.display_name),
      ),
    );
    this.onDom("click", () => Router.go(`/${user.x_username}`));
  }
}
