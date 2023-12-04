import { Component, Popup } from "common-app-module";

export default class SellPersonalKeyPopup extends Popup {
  constructor() {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.sell-personal-key-popup",
      ),
    );
  }
}
