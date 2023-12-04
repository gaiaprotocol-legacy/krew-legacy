import { Component, Popup } from "common-app-module";

export default class SellCommunalKeyPopup extends Popup {
  constructor() {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.sell-communal-key-popup",
      ),
    );
  }
}
