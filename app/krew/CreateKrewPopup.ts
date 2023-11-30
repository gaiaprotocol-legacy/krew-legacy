import { Component, Popup } from "common-app-module";
import CreateKrewForm from "./CreateKrewForm.js";

export default class CreateKrewPopup extends Popup {
  constructor() {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.create-krew-popup",
        new CreateKrewForm(),
      ),
    );
  }
}
