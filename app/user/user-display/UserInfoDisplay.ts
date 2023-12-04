import { DomNode, el } from "common-app-module";
import { SoFiUserPublic } from "sofi-module";

export default class UserInfoDisplay extends DomNode {
  constructor(user: SoFiUserPublic) {
    super(".user-info-display");
    this.append(
      el(".profile-image", {
        style: { backgroundImage: `url(${user.profile_image_thumbnail})` },
      }),
    );
  }
}
