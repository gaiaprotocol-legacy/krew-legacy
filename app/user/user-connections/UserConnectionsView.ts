import { el, msg, Router, Tabs, View, ViewParams } from "common-app-module";
import { SoFiUserPublic } from "sofi-module";
import Layout from "../../layout/Layout.js";
import MaterialIcon from "../../MaterialIcon.js";
import KrewUserService from "../KrewUserService.js";
import FollowerList from "./FollowerList.js";
import FollowingList from "./FollowingList.js";
import HoldingList from "./HoldingList.js";

export default class UserConnectionsView extends View {
  private tabs: Tabs | undefined;
  private holdingList: HoldingList | undefined;
  private followingList: FollowingList | undefined;
  private followerList: FollowerList | undefined;

  constructor(params: ViewParams, uri: string, data?: any) {
    super();
    Layout.append(
      this.container = el(
        ".user-connections-view",
      ),
    );
    this.render(params.xUsername!, uri.substring(uri.indexOf("/") + 1), data);
  }

  public changeParams(params: ViewParams, uri: string, data?: any): void {
    this.render(params.xUsername!, uri.substring(uri.indexOf("/") + 1), data);
  }

  private async render(
    xUsername: string,
    currentTab: string,
    previewUserPublic?: SoFiUserPublic,
  ) {
    let userId = previewUserPublic?.user_id;
    let walletAddress = previewUserPublic?.wallet_address;
    let displayName = previewUserPublic?.display_name;

    if (!previewUserPublic) {
      const userPublic = await KrewUserService.fetchByXUsername(xUsername);
      if (userPublic) {
        [userId, walletAddress, displayName] = [
          userPublic.user_id,
          userPublic.wallet_address,
          userPublic.display_name,
        ];
      }
    }

    if (userId) {
      this.container.empty().append(
        el(
          "header",
          el("button", new MaterialIcon("arrow_back"), {
            click: () => history.back(),
          }),
          el(".info", el("h1", displayName), el("h2", `@${xUsername}`)),
          this.tabs = new Tabs(
            "user-connections",
            walletAddress
              ? [
                { id: "holding", label: msg("user-connections-holding-tab") },
                {
                  id: "following",
                  label: msg("user-connections-following-tab"),
                },
                {
                  id: "followers",
                  label: msg("user-connections-followers-tab"),
                },
              ]
              : [
                {
                  id: "following",
                  label: msg("user-connections-following-tab"),
                },
                {
                  id: "followers",
                  label: msg("user-connections-followers-tab"),
                },
              ],
          ),
          ...(walletAddress
            ? [
              this.holdingList = new HoldingList(walletAddress),
              this.followingList = new FollowingList(userId),
              this.followerList = new FollowerList(userId),
            ]
            : [
              this.followingList = new FollowingList(userId),
              this.followerList = new FollowerList(userId),
            ]),
        ),
      );

      this.tabs.on("select", (id: string) => {
        Router.changeUri(`/${xUsername}/${id}`);
        [
          this.holdingList,
          this.followingList,
          this.followerList,
        ]
          .forEach((list) => list?.hide());
        if (id === "holding") this.holdingList?.show();
        else if (id === "following") this.followingList?.show();
        else if (id === "followers") this.followerList?.show();
      }).select(currentTab);
    } else {
      this.container.empty().append(
        el(
          "header",
          el("button", new MaterialIcon("arrow_back"), {
            click: () => history.back(),
          }),
          el("h1", msg("user-not-found-message")),
        ),
      );
    }
  }
}
