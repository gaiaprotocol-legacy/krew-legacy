import { DateUtil, DomNode, el, Router } from "common-app-module";
import { msgs } from "common-app-module/lib/i18n/msg.js";
import { ethers } from "ethers";
import { AuthorUtil } from "sofi-module";
import BlockTimeManager from "../BlockTimeManager.js";
import Activity, { EventType } from "../database-interface/Activity.js";
import KrewPopup from "../krew/KrewPopup.js";
import KrewUtil from "../krew/KrewUtil.js";

export default class ActivityListItem extends DomNode {
  constructor(activity: Activity) {
    super(".activity-list-item");

    const krewImage = el(".krew-image", {
      style: { backgroundImage: `url(${activity.krew.image})` },
      click: () => new KrewPopup(activity.krew.id, activity.krew),
    });

    const user = el("a", activity.user?.display_name, {
      click: () => Router.go(`/${activity.user?.x_username}`),
    });

    const krew = el("a", KrewUtil.getName(activity.krew), {
      click: () => new KrewPopup(activity.krew.id, activity.krew),
    });

    const date = el(
      ".date",
      DateUtil.fromNow(BlockTimeManager.blockToTime(activity.block_number)),
    );

    if (activity.event_type === EventType.KrewCreated) {
      this.append(
        el("header", krewImage),
        el(
          "p.description",
          ...msgs("activity-list-item-created-krew-text", { user, krew }),
        ),
        date,
      );
    }

    if (activity.event_type === EventType.Trade) {
      const isBuy = activity.args[2] === "true";
      const amount = activity.args[3];
      const price = ethers.formatEther(activity.args[4]);

      const traderProfileImage = el(".trader-profile-image", {
        click: () => Router.go(`/${activity.user?.x_username}`),
      });

      AuthorUtil.selectLoadableProfileImage(traderProfileImage, [
        activity.user?.profile_image_thumbnail,
        activity.user?.stored_profile_image_thumbnail,
      ]);

      this.append(
        el("header", traderProfileImage, krewImage),
        el(
          "p.description",
          ...msgs(
            isBuy
              ? "activity-list-item-bought-key-text"
              : "activity-list-item-sold-key-text",
            { user, krew, amount, price },
          ),
        ),
        date,
      );
    }
  }
}
