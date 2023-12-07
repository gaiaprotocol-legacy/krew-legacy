import {
  Button,
  ButtonType,
  Component,
  el,
  msg,
  Popup,
} from "common-app-module";
import Krew from "../database-interface/Krew.js";
import PreviewKrew from "../database-interface/PreviewKrew.js";

export default class EditKrewPopup extends Popup {
  private krew: Krew | undefined;

  constructor(private krewId: string, previewKrew?: PreviewKrew) {
    super({ barrierDismissible: true });

    this.append(
      new Component(
        ".popup.edit-krew-popup",
        el(
          "header",
          el(".krew-image", {
            style: {
              backgroundImage: `url(${previewKrew?.image_thumbnail})`,
            },
          }),
          el("h1", "Edit Krew"),
        ),
        el(
          "main",
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel",
            click: () => this.delete(),
            title: msg("cancel-button"),
          }),
          new Button({
            tag: ".save",
            title: msg("edit-krew-popup-save-button"),
            //click: () => {
          }),
        ),
      ),
    );

    this.fetchKrew();
  }

  private fetchKrew() {
    //TODO:
  }
}
