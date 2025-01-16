import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  msg,
  Popup,
} from "@common-module/app";
import { BigNumber, ethers } from "ethers";
import KrewContract from "../contracts/KrewContract.js";
import KrewPersonalContract from "../contracts/KrewPersonalContract.js";
import Krew from "../database-interface/Krew.js";
import KrewType from "../database-interface/KrewType.js";
import KrewService from "../krew/KrewService.js";
import KrewUtil from "../krew/KrewUtil.js";

export default class SellKeyPopup extends Popup {
  private priceDisplay: DomNode;
  private totalPriceDisplay: DomNode;
  private sellButton: Button;

  constructor(private krew: Krew) {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.sell-key-popup",
        el(
          "header",
          el(
            "h1",
            msg("sell-key-popup-title", {
              krew: KrewUtil.getName(krew),
            }),
          ),
        ),
        el(
          "main",
          el(".krew-image", {
            style: {
              backgroundImage: `url(${krew.image})`,
            },
          }),
          el(
            "table",
            el(
              "tr",
              el("th", msg("sell-key-popup-price-title")),
              el(
                "td",
                this.priceDisplay = el("span", "..."),
                " ETH",
              ),
            ),
            el(
              "tr",
              el("th", msg("sell-key-popup-total-price-title")),
              el(
                "td",
                this.totalPriceDisplay = el("span", "..."),
                " ETH",
              ),
            ),
          ),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel",
            click: () => this.delete(),
            title: msg("cancel-button"),
          }),
          this.sellButton = new Button({
            type: ButtonType.Contained,
            tag: ".sell",
            click: () => this.sellKeys(),
            title: msg("sell-key-popup-sell-button", {
              krew: KrewUtil.getName(krew),
            }),
          }),
        ),
      ),
    );

    this.fetchPrice();
    this.fetchTotalPrice();
  }

  private get krewType(): KrewType {
    if (this.krew.id.startsWith("p_")) {
      return KrewType.Personal;
    } else if (this.krew.id.startsWith("c_")) {
      return KrewType.Communal;
    }
    throw new Error("Invalid krew id");
  }

  private get krewContract(): KrewContract {
    const krewType = this.krewType;
    if (krewType === KrewType.Personal) {
      return KrewPersonalContract;
    } else if (krewType === KrewType.Communal) {
      return KrewPersonalContract;
    }
    throw new Error("Invalid krew type");
  }

  private get krewId() {
    return BigNumber.from(this.krew.id.substring(2));
  }

  private async fetchPrice() {
    const price = await this.krewContract.getSellPrice(
      this.krewId,
      BigNumber.from(1),
    );
    this.priceDisplay.text = `${ethers.utils.formatEther(price)}`;
  }

  private async fetchTotalPrice() {
    const price = await this.krewContract.getSellPriceAfterFee(
      this.krewId,
      BigNumber.from(1),
    );
    this.totalPriceDisplay.text = `${ethers.utils.formatEther(price)}`;
  }

  private async trackEvents() {
    if (this.krewType === KrewType.Personal) {
      await KrewService.trackPersonalEvents();
    } else if (this.krewType === KrewType.Communal) {
      await KrewService.trackCommunalEvents();
    }
  }

  private async sellKeys() {
    this.sellButton.title = el(".loading-spinner");

    try {
      await this.krewContract.sellKeys(this.krewId, BigNumber.from(1));
      await Promise.all([
        this.trackEvents(),
        KrewService.trackKeyPriceAndBalance(this.krew.id),
      ]);
      this.delete();
    } catch (e) {
      this.sellButton.title = msg("sell-key-popup-sell-button", {
        krew: KrewUtil.getName(this.krew),
      });
      throw e;
    }
  }
}
