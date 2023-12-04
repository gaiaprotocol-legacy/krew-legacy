import { Component, Popup } from "common-app-module";

export default class BuyPersonalKeyPopup extends Popup {
  constructor() {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.buy-personal-key-popup",
      ),
    );
  }
}
