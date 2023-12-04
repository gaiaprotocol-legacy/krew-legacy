import { DomNode, el } from "common-app-module";
import { SoFiUserPublic } from "sofi-module";
import BuyKeyPopup from "../../key/BuyKeyPopup.js";
import KrewService from "../../krew/KrewService.js";

export default class UserProfile extends DomNode {
  private krewsFetched = false;

  constructor(
    private user: SoFiUserPublic | undefined,
    private displayClaimableFee = false,
  ) {
    super(".user-profile");
    if (user) this.renderUser(user);
    this.fetchKrews();
  }

  public updateUser(user: SoFiUserPublic | undefined) {
    this.user = user;
    if (user) this.renderUser(user);
    this.fetchKrews();
  }

  private renderUser(user: SoFiUserPublic) {
    //TODO:
  }

  private async fetchKrews() {
    if (this.user?.wallet_address) {
      if (this.krewsFetched) return;
      this.krewsFetched = true;

      const krews = await KrewService.fetchOwnedKrews(
        this.user.wallet_address,
      );
      for (const krew of krews) {
        this.append(
          el("h1", krew.id),
          el("a", "buy", {
            click: () => new BuyKeyPopup(krew),
          }),
        );
      }
    }
  }
}
