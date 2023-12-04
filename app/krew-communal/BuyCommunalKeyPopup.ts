import {
  Button,
  ButtonType,
  Component,
  el,
  msg,
  Popup,
} from "common-app-module";
import KrewCommunalContract from "../contracts/KrewCommunalContract.js";
import Krew from "../database-interface/Krew.js";
import KrewService from "../krew/KrewService.js";

export default class BuyCommunalKeyPopup extends Popup {
  private buyButton: Button;

  constructor(private krew: Krew) {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.buy-communal-key-popup",
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
            tag: ".buy-token-button",
            click: () => this.buyKeys(),
            title: msg("buy-key-popup-buy-button", {
              krew: krew.name ?? "Krew",
            }),
          }),
        ),
      ),
    );
  }

  private async buyKeys() {
    await KrewCommunalContract.buyKeys(BigInt(this.krew.id.substring(2)), 1n);
    await KrewService.trackCommunalEvents();
  }
}
