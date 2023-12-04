import { DomNode, el } from "common-app-module";
import { SoFiUserPublic } from "sofi-module";
import BuyKeyPopup from "../../key/BuyKeyPopup.js";
import KrewService from "../../krew/KrewService.js";

export default class UserProfile extends DomNode {
  private claimableFeeFetched = false;
  private portfolioValueFetched = false;
  private krewsFetched = false;

  constructor(
    user: SoFiUserPublic | undefined,
    private displayClaimableFee = false,
  ) {
    super(".user-profile");

    this.append(
      el("section.info"),
      displayClaimableFee ? el("section.claimable-fee") : undefined,
      el("section.krews"),
      el("section.metrics"),
      el("section.connections"),
    );

    if (user) {
      this.renderUser(user);
      if (user.wallet_address) {
        this.fetchClaimableFee(user.wallet_address);
        this.fetchPortfolioValue(user.wallet_address);
        this.fetchKrews(user.wallet_address);
      }
    }
  }

  public updateUser(user: SoFiUserPublic | undefined) {
    if (user) {
      this.renderUser(user);
      if (user.wallet_address) {
        this.fetchClaimableFee(user.wallet_address);
        this.fetchPortfolioValue(user.wallet_address);
        this.fetchKrews(user.wallet_address);
      }
    }
  }

  private renderUser(user: SoFiUserPublic) {
    //TODO:
  }

  private async fetchClaimableFee(walletAddress: string) {
    if (!this.displayClaimableFee || this.claimableFeeFetched) return;
    this.claimableFeeFetched = true;

    //TODO:
  }

  private async fetchPortfolioValue(walletAddress: string) {
    if (this.portfolioValueFetched) return;
    this.portfolioValueFetched = true;

    //TODO:
  }

  private async fetchKrews(walletAddress: string) {
    if (this.krewsFetched) return;
    this.krewsFetched = true;

    const krews = await KrewService.fetchOwnedKrews(walletAddress);
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
