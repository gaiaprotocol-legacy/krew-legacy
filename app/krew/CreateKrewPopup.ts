import { el, Popup } from "common-app-module";

export default class CreateKrewPopup extends Popup {
  constructor() {
    super({ barrierDismissible: true });
    this.append(el(
      ".popup.create-krew-popup",
    ));
  }
}
