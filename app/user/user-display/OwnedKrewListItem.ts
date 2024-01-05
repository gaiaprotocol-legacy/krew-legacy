import { Button, DomNode, el } from "@common-module/app";
import { ethers } from "ethers";
import KrewCommunalContract from "../../contracts/KrewCommunalContract.js";
import KrewPersonalContract from "../../contracts/KrewPersonalContract.js";
import Krew from "../../database-interface/Krew.js";
import BuyKeyPopup from "../../key/BuyKeyPopup.js";
import KrewPopup from "../../krew/KrewPopup.js";
import KrewUtil from "../../krew/KrewUtil.js";
import KrewSignedUserManager from "../KrewSignedUserManager.js";

export default class OwnedKrewListItem extends DomNode {
  private claimableFee: DomNode | undefined;

  constructor(private krew: Krew, feeClaimable: boolean) {
    super(".owned-krew-list-item");
    this.append(
      el(
        "main",
        el(".krew-image", {
          style: { backgroundImage: `url(${krew.image})` },
        }),
        el(
          ".info",
          el(".name", KrewUtil.getName(krew)),
          el(
            ".metric-container",
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
        ),
      ),
      el(
        "footer",
        feeClaimable
          ? new Button({
            title: "Claim Fee",
            click: (event) => {
              event.stopPropagation();
              this.claimFee();
            },
          })
          : undefined,
        new Button({
          title: "Buy",
          click: (event) => {
            event.stopPropagation();
            new BuyKeyPopup(krew);
          },
        }),
      ),
    );

    if (feeClaimable) this.fetchClaimableFee();

    this.onDom("click", () => new KrewPopup(krew.id, krew));
  }

  private async fetchClaimableFee() {
    if (this.claimableFee) {
      if (KrewSignedUserManager.user?.wallet_address) {
        if (this.krew.id.startsWith("p_")) {
          this.claimableFee.text = ethers.formatEther(
            await KrewPersonalContract.getClaimableFee(
              BigInt(this.krew.id.substring(2)),
            ),
          ) + " ETH";
        } else if (this.krew.id.startsWith("c_")) {
          this.claimableFee.text = ethers.formatEther(
            await KrewCommunalContract.getClaimableFee(
              BigInt(this.krew.id.substring(2)),
              KrewSignedUserManager.user.wallet_address,
            ),
          ) + " ETH";
        }
      } else {
        this.claimableFee.text = "0";
      }
    }
  }

  private async claimFee() {
    if (this.krew.id.startsWith("p_")) {
      await KrewPersonalContract.claimFee(
        BigInt(this.krew.id.substring(2)),
      );
    } else if (this.krew.id.startsWith("c_")) {
      await KrewCommunalContract.claimFee(
        BigInt(this.krew.id.substring(2)),
      );
    }
  }
}
