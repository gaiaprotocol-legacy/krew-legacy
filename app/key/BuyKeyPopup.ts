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
import KrewContract from "../contracts/KrewContract.js";
import KrewPersonalContract from "../contracts/KrewPersonalContract.js";
import Krew from "../database-interface/Krew.js";
import KrewType from "../database-interface/KrewType.js";
import KrewService from "../krew/KrewService.js";

export default class BuyKeyPopup extends Popup {
  private priceDisplay: DomNode;
  private totalPriceDisplay: DomNode;
  private buyButton: Button;

  constructor(private krew: Krew) {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.buy-key-popup",
        el(
          "header",
          el(
            "h1",
            msg("buy-key-popup-title", {
              krew: krew.name ?? "Krew",
            }),
          ),
        ),
        el(
          "main",
          el(".krew-image", {
            style: {
              backgroundImage: `url(${krew.profile_image_thumbnail})`,
            },
          }),
          el(
            "table",
            el(
              "tr",
              el("th", msg("buy-key-popup-price-title")),
              el(
                "td",
                this.priceDisplay = el("span", "..."),
                " ETH",
              ),
            ),
            el(
              "tr",
              el("th", msg("buy-key-popup-total-price-title")),
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
          this.buyButton = new Button({
            type: ButtonType.Contained,
            tag: ".buy",
            click: () => this.buyKeys(),
            title: msg("buy-key-popup-buy-button", {
              krew: krew.name ?? "Krew",
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
    return BigInt(this.krew.id.substring(2));
  }

  private async fetchPrice() {
    const price = await this.krewContract.getBuyPrice(this.krewId, 1n);
    this.priceDisplay.text = `${ethers.formatEther(price)}`;
  }

  private async fetchTotalPrice() {
    const price = await this.krewContract.getBuyPriceAfterFee(
      this.krewId,
      1n,
    );
    this.totalPriceDisplay.text = `${ethers.formatEther(price)}`;
  }

  private async buyKeys() {
    await this.krewContract.buyKeys(this.krewId, 1n);
    if (this.krewType === KrewType.Personal) {
      await KrewService.trackPersonalEvents();
    } else if (this.krewType === KrewType.Communal) {
      await KrewService.trackCommunalEvents();
    }
    await KrewService.trackKeyPriceAndBalance(this.krew.id);
  }
}
