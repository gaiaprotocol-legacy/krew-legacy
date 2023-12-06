import { DateUtil, DomNode, el, msg } from "common-app-module";
import { PreviewUserPublic, SoFiUserPublic } from "sofi-module";
import BuyKeyPopup from "../../key/BuyKeyPopup.js";
import KrewService from "../../krew/KrewService.js";

export default class UserProfile extends DomNode {
  private claimableFeeFetched = false;
  private portfolioValueFetched = false;
  private krewsFetched = false;

  private info: DomNode;
  private claimableFee: DomNode | undefined;
  private krews: DomNode;
  private metrics: DomNode;
  private connections: DomNode;

  constructor(
    previewUser: PreviewUserPublic | undefined,
    private displayClaimableFee = false,
  ) {
    super(".user-profile");
    this.append(
      this.info = el("section.info"),
      displayClaimableFee
        ? this.claimableFee = el("section.claimable-fee")
        : undefined,
      this.krews = el("section.krews"),
      this.metrics = el("section.metrics"),
      this.connections = el("section.connections"),
    );
    if (previewUser) this.renderUser(previewUser);
  }

  public set user(user: SoFiUserPublic | undefined) {
    if (user) {
      this.renderUser(user);
      if (user.wallet_address) {
        this.fetchClaimableFee(user.wallet_address);
        this.fetchPortfolioValue(user.wallet_address);
        this.fetchKrews(user.wallet_address);
      }
    }
  }

  private renderUser(user: PreviewUserPublic & { created_at?: string }) {
    this.info.empty().append(
      el(".profile-image", {
        style: {
          backgroundImage: `url(${user.profile_image})`,
        },
      }),
      el(
        ".info",
        el("h2", user.display_name),
        el(
          "h3",
          el("a", `@${user.x_username}`, {
            href: `https://x.com/${user.x_username}`,
            target: "_blank",
          }),
        ),
        el(
          "p",
          msg("user-profile-joined", {
            date: DateUtil.format(user.created_at ?? "-infinity"),
          }),
        ),
        el(
          "footer",
          el("a", "𝕏", {
            href: `https://twitter.com/${user.x_username}`,
            target: "_blank",
          }),
        ),
      ),
    );
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

    this.krews.empty();

    const krews = await KrewService.fetchOwnedKrews(walletAddress, undefined);
    for (const krew of krews) {
      this.krews.append(
        el("h1", krew.id),
        el("a", "buy", {
          click: () => new BuyKeyPopup(krew),
        }),
      );
    }
  }
}
