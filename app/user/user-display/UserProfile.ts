import { DateUtil, DomNode, el, msg, Router } from "common-app-module";
import { PreviewUserPublic, SoFiUserPublic } from "sofi-module";
import KrewService from "../../krew/KrewService.js";
import MaterialIcon from "../../MaterialIcon.js";
import KrewUserService from "../KrewUserService.js";
import OwnedKrewListItem from "./OwnedKrewListItem.js";

export default class UserProfile extends DomNode {
  private feesEarnedFetched = false;
  private portfolioValueFetched = false;
  private krewsFetched = false;

  private infoContainer: DomNode;
  private claimableFee: DomNode | undefined;
  private krewList: DomNode;

  private feesEarnedDisplay: DomNode;
  private portfolioValueDisplay: DomNode;

  private holdingDisplay: DomNode;
  private followingDisplay: DomNode;
  private followersDisplay: DomNode;

  constructor(
    xUsername: string,
    previewUser: PreviewUserPublic | undefined,
    private feeClaimable = false,
  ) {
    super(".user-profile");
    this.append(
      this.infoContainer = el(".info-container"),
      this.krewList = el(".krew-list"),
      el(
        ".metrics-container",
        el(
          "section.earned",
          el(".icon-container", new MaterialIcon("savings")),
          el(
            ".metric",
            el("h3", "Fees Earned"),
            this.feesEarnedDisplay = el(".value", "..."),
          ),
        ),
        el(
          "section.portfolio-value",
          el(".icon-container", new MaterialIcon("account_balance")),
          el(
            ".metric",
            el("h3", "Portfolio Value"),
            this.portfolioValueDisplay = el(".value", "..."),
          ),
        ),
      ),
      el(
        ".connections-container",
        el(
          "a.holding",
          this.holdingDisplay = el(".value", "..."),
          el("h3", "Holding"),
          { click: () => Router.go(`/${xUsername}/holding`) },
        ),
        el(
          "a.following",
          this.followingDisplay = el(".value", "..."),
          el("h3", "Following"),
          { click: () => Router.go(`/${xUsername}/following`) },
        ),
        el(
          "a.followers",
          this.followersDisplay = el(".value", "..."),
          el("h3", "Followers"),
          { click: () => Router.go(`/${xUsername}/followers`) },
        ),
      ),
    );
    if (previewUser) this.renderUser(previewUser);
  }

  public set user(user: SoFiUserPublic | undefined) {
    if (user) {
      this.renderUser(user);
      if (user.wallet_address) {
        this.fetchFeesEarned(user.wallet_address);
        this.fetchPortfolioValue(user.wallet_address);
        this.fetchKrews(user.wallet_address);
      }
    }
  }

  private renderUser(user: PreviewUserPublic & { created_at?: string }) {
    this.infoContainer.empty().append(
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

  private async fetchFeesEarned(walletAddress: string) {
    if (this.feesEarnedFetched) return;
    this.feesEarnedFetched = true;

    //TODO:
  }

  private async fetchPortfolioValue(walletAddress: string) {
    if (this.portfolioValueFetched) return;
    this.portfolioValueFetched = true;

    const result = await KrewUserService.fetchPortfolioValue(walletAddress);
    console.log(result);
  }

  private async fetchKrews(walletAddress: string) {
    if (this.krewsFetched) return;
    this.krewsFetched = true;

    this.krewList.empty();

    const krews = await KrewService.fetchOwnedKrews(walletAddress, undefined);
    for (const krew of krews) {
      this.krewList.append(
        new OwnedKrewListItem(krew, this.feeClaimable),
      );
    }
  }
}
