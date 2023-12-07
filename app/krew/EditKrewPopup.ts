import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  msg,
  Popup,
} from "common-app-module";
import Krew from "../database-interface/Krew.js";
import PreviewKrew from "../database-interface/PreviewKrew.js";
import KrewService from "./KrewService.js";

export default class EditKrewPopup extends Popup {
  private krew: Krew | undefined;

  private nameInput: DomNode<HTMLInputElement>;
  private descriptionTextArea: DomNode<HTMLTextAreaElement>;
  private uploadInput: DomNode<HTMLInputElement>;

  constructor(private krewId: string, previewKrew?: PreviewKrew) {
    super({ barrierDismissible: true });

    this.append(
      new Component(
        ".popup.edit-krew-popup",
        el(
          "header",
          el(".krew-image", {
            style: {
              backgroundImage: `url(${previewKrew?.image})`,
            },
          }),
          el("h1", "Edit Krew"),
        ),
        el(
          "main",
          this.nameInput = el("input"),
          this.descriptionTextArea = el("textarea"),
          this.uploadInput = el("input.upload", {
            type: "file",
            change: () => {
              const files = this.uploadInput.domElement.files;
              if (files) {
                console.log(files);
              }
            },
          }),
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
            click: () => this.updateKrew(),
          }),
        ),
      ),
    );

    this.fetchKrew();
  }

  private fetchKrew() {
    //TODO:
  }

  private async updateKrew() {
    //await KrewService.updateKrew();
  }
}
