import { el, msg, Router, Tabs, View, ViewParams } from "common-app-module";
import { PreviewUserPublic } from "sofi-module";
import Layout from "../../layout/Layout.js";
import MaterialIcon from "../../MaterialIcon.js";
import KrewUserCacher from "../KrewUserCacher.js";
import KrewUserService from "../KrewUserService.js";

export default class UserConnectionsView extends View {
  private tabs: Tabs | undefined;

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
          KrewUserCacher.cache(userPublic);
        }
      }
    }

    if (userId) {
      this.container.empty().append(
        el(
          "header",
          el("button", new MaterialIcon("arrow_back"), {
            click: () => history.back(),
          }),
          el(".info", el("h1", username), el("h2", `@${xUsername}`)),
          this.tabs = new Tabs("user-connections", [
            { id: "holding", label: msg("user-connections-holding-tab") },
            { id: "holders", label: msg("user-connections-holders-tab") },
            { id: "following", label: msg("user-connections-following-tab") },
            { id: "followers", label: msg("user-connections-followers-tab") },
          ]),
        ),
      );
      this.tabs.on("select", (id: string) => {
        Router.changeUri(`/${xUsername}/${id}`);
        //TODO:
      });
      this.tabs.select(currentTab);
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
