import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  msg,
  Popup,
} from "common-app-module";
import { ethers } from "ethers";
import KrewCommunalContract from "../contracts/KrewCommunalContract.js";
import KrewPersonalContract from "../contracts/KrewPersonalContract.js";
import Krew from "../database-interface/Krew.js";
import PreviewKrew from "../database-interface/PreviewKrew.js";
import BuyKeyPopup from "../key/BuyKeyPopup.js";
import SellKeyPopup from "../key/SellKeyPopup.js";
import MaterialIcon from "../MaterialIcon.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import EditKrewPopup from "./EditKrewPopup.js";
import KrewService from "./KrewService.js";
import KrewUtil from "./KrewUtil.js";

export default class KrewPopup extends Popup {
  private krew: Krew | undefined;

  private editButton: DomNode;
  private holderCountDisplay: DomNode;
  private priceDisplay: DomNode;
  private balanceDisplay: DomNode;

  constructor(private krewId: string, previewKrew?: PreviewKrew) {
    super({ barrierDismissible: true });

    this.append(
      new Component(
        ".popup.krew-popup",
        el(
          "header",
          el(".krew-image", {
            style: {
              backgroundImage: `url(${previewKrew?.image})`,
            },
          }),
          el("h1", previewKrew ? KrewUtil.getName(previewKrew) : "..."),
          this.editButton = el("a.edit.hidden", new MaterialIcon("edit"), {
            click: () => {
              new EditKrewPopup(krewId, previewKrew);
              this.delete();
            },
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
              this.holderCountDisplay = el(".value", "..."),
            ),
          ),
          el(
            "section.price",
            el(".icon-container", new MaterialIcon("sell")),
            el(
              ".metric",
              el("h3", "Price"),
              this.priceDisplay = el(".value", "..."),
            ),
          ),
        ),
        el(
          ".balance-container",
          el(
            ".balance",
            el("h3", "Your Balance"),
            this.balanceDisplay = el(".value", "..."),
          ),
          new Button({
            title: "Buy",
            click: () => this.buyKey(),
          }),
          new Button({
            title: "Sell",
            click: () => this.sellKey(),
          }),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel",
            click: () => this.delete(),
            title: msg("cancel-button"),
          }),
        ),
      ),
    );

    this.fetchKrew();
    this.fetchBalance();
  }

  private async fetchKrew() {
    this.krew = await KrewService.fetchKrew(this.krewId);
    if (this.krew) {
      this.holderCountDisplay.text = this.krew.key_holder_count.toString();
      this.priceDisplay.text = ethers.formatEther(
        this.krew.last_fetched_key_price,
      );

      if (this.krew.owner === KrewSignedUserManager.user?.wallet_address) {
        this.editButton.deleteClass("hidden");
      }
    }
  }

  private async fetchBalance() {
    const walletAddress = KrewSignedUserManager.user?.wallet_address;
    if (walletAddress) {
      if (this.krewId.startsWith("p_")) {
        this.balanceDisplay.text = String(
          await KrewPersonalContract.getBalance(
            BigInt(this.krewId.substring(2)),
            walletAddress,
          ),
        );
      } else if (this.krewId.startsWith("c_")) {
        this.balanceDisplay.text = String(
          await KrewCommunalContract.getBalance(
            BigInt(this.krewId.substring(2)),
            walletAddress,
          ),
        );
      }
    } else {
      this.balanceDisplay.text = "0";
    }
  }

  private async buyKey() {
    if (this.krew) new BuyKeyPopup(this.krew);
  }

  private async sellKey() {
    if (this.krew) new SellKeyPopup(this.krew);
  }
}
