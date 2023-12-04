import { el, View, ViewParams } from "common-app-module";
import { PreviewUserPublic } from "sofi-module";
import KrewCommunalContract from "../contracts/KrewCommunalContract.js";
import BuyPersonalKeyPopup from "../krew-personal/BuyPersonalKeyPopup.js";
import KrewService from "../krew/KrewService.js";
import Layout from "../layout/Layout.js";
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
    const userPublic = await KrewUserService.fetchByXUsername(xUsername);
    if (userPublic?.wallet_address) {
      const krews = await KrewService.fetchOwnedKrews(
        userPublic.wallet_address,
      );
      this.container.empty();
      for (const krew of krews) {
        this.container.append(
          el("h1", krew.id),
          el("a", "buy", {
            click: async () => {
              if (krew.id.startsWith("p_")) {
                new BuyPersonalKeyPopup(krew);
              } else if (krew.id.startsWith("c_")) {
                await KrewCommunalContract.buyKeys(
                  BigInt(krew.id.substring(2)),
                  1n,
                );
                await KrewService.trackCommunalEvents();
              }
            },
          }),
        );
      }
    }
  }
}
