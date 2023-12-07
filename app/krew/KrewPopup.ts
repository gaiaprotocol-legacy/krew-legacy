import { Component, el, Icon, Popup } from "common-app-module";
import { ethers } from "ethers";
import Krew from "../database-interface/Krew.js";
import MaterialIcon from "../MaterialIcon.js";
import EditKrewPopup from "./EditKrewPopup.js";
import KrewUtil from "./KrewUtil.js";

export default class KrewPopup extends Popup {
  private krew: Krew | undefined;

  constructor(private krewId: string, previewKrew?: Krew) {
    super({ barrierDismissible: true });
    this.krew = previewKrew;

    this.append(
      new Component(
        ".popup.krew-popup",
        el(
          "header",
          el(".krew-image", {
            style: {
              backgroundImage: `url(${previewKrew?.image_thumbnail})`,
            },
          }),
          el("h1", previewKrew ? KrewUtil.getName(previewKrew) : undefined),
          this.editButton = el("a.hidden", new Icon("edit"), {
            click: () => new EditKrewPopup(krewId, this.krew),
          }),
        ),
        el(
          ".metric-container",
          el(
            "section.price",
            el(".icon-container", new MaterialIcon("group")),
            el(
              ".metric",
              el("h3", "Holders"),
              el(
                ".value",
                previewKrew ? String(previewKrew.key_holder_count) : "...",
              ),
            ),
          ),
          el(
            "section.price",
            el(".icon-container", new MaterialIcon("sell")),
            el(
              ".metric",
              el("h3", "Price"),
              el(
                ".value",
                previewKrew
                  ? ethers.formatEther(previewKrew.last_fetched_key_price) +
                    " ETH"
                  : "...",
              ),
            ),
          ),
        ),
        el(".balance", "..."),
        el("footer"),
      ),
    );

    this.fetchKrew();
  }

  private fetchKrew() {
    //TODO:
  }
}
