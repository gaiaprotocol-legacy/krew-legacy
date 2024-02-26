import { Component, Popup } from "@common-module/app";

export default class TradePersonalKeyPopup extends Popup {
  constructor() {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.trade-personal-key-popup",
      ),
    );

    //TODO:
  }
}
