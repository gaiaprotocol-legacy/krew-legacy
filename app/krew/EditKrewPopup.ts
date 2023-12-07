import { Component, Popup } from "common-app-module";
import Krew from "../database-interface/Krew.js";

export default class EditKrewPopup extends Popup {
  constructor(krew: string, previewKrew?: Krew) {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.edit-krew-popup",
      ),
    );
  }
}
