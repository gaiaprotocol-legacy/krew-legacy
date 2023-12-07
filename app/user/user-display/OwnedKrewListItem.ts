import { Button, DomNode, el } from "common-app-module";
import { ethers } from "ethers";
import Krew from "../../database-interface/Krew.js";
import BuyKeyPopup from "../../key/BuyKeyPopup.js";
import KrewUtil from "../../krew/KrewUtil.js";

export default class OwnedKrewListItem extends DomNode {
  private claimableFee: DomNode | undefined;

  constructor(krew: Krew, feeClaimable: boolean) {
    super(".owned-krew-list-item");
    this.append(
      el("h1", KrewUtil.getName(krew)),
      el(
        "main",
        feeClaimable
          ? el(
            ".metric",
            el("h3", "Fee Claimable"),
            this.claimableFee = el(".value", "..."),
          )
          : undefined,
        el(
          ".metric",
          el("h3", "Price"),
          el(
            ".value",
            ethers.formatEther(krew.last_fetched_key_price) + " ETH",
          ),
        ),
      ),
      el(
        "footer",
        feeClaimable
          ? new Button({
            title: "Claim Fee",
            click: () => {
            },
          })
          : undefined,
        new Button({
          title: "Buy",
          click: () => new BuyKeyPopup(krew),
        }),
      ),
    );

    if (feeClaimable) this.claimFee();
  }

  private async claimFee() {
    //TODO:
  }
}
