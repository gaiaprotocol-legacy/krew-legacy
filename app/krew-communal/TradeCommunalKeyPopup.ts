import { Component, Popup } from "common-app-module";

export default class TradeCommunalKeyPopup extends Popup {
  constructor() {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.trade-communal-key-popup",
      ),
    );
  }
}
