import { DateUtil, DomNode, el, Router } from "common-app-module";
import { msgs } from "common-app-module/lib/i18n/msg.js";
import { ethers } from "ethers";
import BlockTimeManager from "../BlockTimeManager.js";
import KrewContractEvent, {
  EventType,
} from "../database-interface/KrewContractEvent.js";
import KrewPopup from "../krew/KrewPopup.js";
import KrewUtil from "../krew/KrewUtil.js";

export default class ActivityListItem extends DomNode {
  constructor(event: KrewContractEvent) {
    super(".activity-list-item");

    const krewImage = el(".krew-image", {
      style: { backgroundImage: `url(${event.krew.image})` },
      click: () => new KrewPopup(event.krew.id, event.krew),
    });

    const user = el("a", event.user?.display_name, {
      click: () => Router.go(`/${event.user?.x_username}`),
    });

    const krew = el("a", KrewUtil.getName(event.krew), {
      click: () => new KrewPopup(event.krew.id, event.krew),
    });

    const date = el(
      ".date",
      DateUtil.fromNow(BlockTimeManager.blockToTime(event.block_number)),
    );

    if (event.event_type === EventType.KrewCreated) {
      this.append(
        el("header", krewImage),
        el(
          "p.description",
          ...msgs("activity-list-item-created-krew-text", { user, krew }),
        ),
        date,
      );
    }

    if (event.event_type === EventType.Trade) {
      const isBuy = event.args[2] === "true";
      const amount = event.args[3];
      const price = ethers.formatEther(event.args[4]);

      this.append(
        el(
          "header",
          el(".trader-profile-image", {
            style: {
              backgroundImage: `url(${event.user?.profile_image_thumbnail})`,
            },
            click: () => Router.go(`/${event.user?.x_username}`),
          }),
          krewImage,
        ),
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
