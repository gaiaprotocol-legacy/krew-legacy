import { el, View, ViewParams } from "common-app-module";
import { PreviewUserPublic } from "sofi-module";
import KrewService from "../krew/KrewService.js";
import Layout from "../layout/Layout.js";
import KrewUserCacher from "./KrewUserCacher.js";
import KrewUserService from "./KrewUserService.js";

export default class UserView extends View {
  constructor(params: ViewParams, uri: string, data?: any) {
    super();
    Layout.append(
      this.container = el(".user-view"),
    );
    this.render(params.xUsername!, data);
  }

  public changeParams(params: ViewParams, uri: string, data?: any): void {
    this.render(params.xUsername!, data);
  }

  private async render(
    xUsername: string,
    previewUserPublic?: PreviewUserPublic,
  ) {
    let username = previewUserPublic?.display_name;
    let userId = previewUserPublic?.user_id;
    if (!previewUserPublic) {
      const cached = KrewUserCacher.getByXUsername(xUsername);
      if (cached) {
        username = cached.display_name;
        userId = cached.user_id;
      } else {
        const userPublic = await KrewUserService.fetchByXUsername(xUsername);
        if (userPublic) {
          username = userPublic.display_name;
          userId = userPublic.user_id;
        }
      }
    }

    //TODO:

    const userPublic = await KrewUserService.fetchByXUsername(xUsername);
    if (userPublic?.wallet_address) {
      const krews = await KrewService.fetchOwnedKrews(
        userPublic.wallet_address,
      );
      this.container.empty().append(
        el("section.user-info"),
        el("section.krews"),
        el("section.metrics"),
        el("section.connections"),
      );

      /*for (const krew of krews) {
        this.container.append(
          el("h1", krew.id),
          el("a", "buy", {
            click: () => new BuyKeyPopup(krew),
          }),
        );
      }*/
    }
  }
}
