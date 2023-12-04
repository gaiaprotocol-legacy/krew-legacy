import { Component, Popup } from "common-app-module";

export default class BuyCommunalKeyPopup extends Popup {
  constructor() {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.buy-communal-key-popup",
      ),
    );
  }
}
