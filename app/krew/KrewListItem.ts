import { DomNode, el } from "common-app-module";
import { ethers } from "ethers";
import MaterialIcon from "../MaterialIcon.js";
import Krew from "../database-interface/Krew.js";

export default class KrewListItem extends DomNode {
  constructor(krew: Krew) {
    super(".krew-list-item");
    this.append(
      el(
        ".info",
        el(".krew-image", {
          style: { backgroundImage: `url(${krew.image_thumbnail})` },
        }),
        el(".name", krew.name),
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
              String(krew.key_holder_count),
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
              ethers.formatEther(krew.last_fetched_key_price) + " ETH",
            ),
          ),
        ),
      ),
    );
  }
}
