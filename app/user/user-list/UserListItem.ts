import { DomNode, el, Router } from "common-app-module";
import { SoFiUserPublic } from "sofi-module";

export default class UserListItem extends DomNode {
  constructor(user: SoFiUserPublic) {
    super(".user-list-item");
    this.append(
      el(
        ".info",
        el(".profile-image", {
          style: { backgroundImage: `url(${user.profile_image_thumbnail})` },
        }),
        el(".name", user.display_name),
      ),
    );
    this.onDom("click", () => Router.go(`/${user.x_username}`));
  }
}
