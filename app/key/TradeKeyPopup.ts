import { Component, Popup } from "common-app-module";

export default class TradePersonalKeyPopup extends Popup {
  constructor() {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.trade-personal-key-popup",
      ),
    );
  }
}
