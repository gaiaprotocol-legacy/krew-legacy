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
  private krewImage: File | undefined;

  private krewImageDisplay: DomNode<HTMLDivElement>;
  private nameInput: DomNode<HTMLInputElement>;
  private descriptionTextArea: DomNode<HTMLTextAreaElement>;
  private uploadImageInput: DomNode<HTMLInputElement>;
  private saveButton: Button;

  constructor(private krewId: string, previewKrew?: PreviewKrew) {
    super({ barrierDismissible: true });

    this.append(
      new Component(
        ".popup.edit-krew-popup",
        el(
          "header",
          this.krewImageDisplay = el(".krew-image", {
            style: {
              backgroundImage: `url(${previewKrew?.image})`,
            },
            click: () => this.uploadImageInput.domElement.click(),
          }),
          this.uploadImageInput = el("input.upload", {
            type: "file",
            change: () => {
              const files = this.uploadImageInput.domElement.files;
              this.krewImage = files?.[0];
              if (this.krewImage) {
                this.krewImageDisplay.style({
                  backgroundImage: `url(${
                    URL.createObjectURL(
                      this.krewImage,
                    )
                  })`,
                });
              }
            },
          }),
        ),
        el(
          "main",
          this.nameInput = el("input", {
            placeholder: "Name",
            value: previewKrew?.name,
          }),
          this.descriptionTextArea = el("textarea", {
            placeholder: "Description",
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
          this.saveButton = new Button({
            tag: ".save",
            title: msg("edit-krew-popup-save-button"),
            click: () => this.updateKrew(),
          }),
        ),
      ),
    );

    this.fetchKrew();
  }

  private async fetchKrew() {
    this.krew = await KrewService.fetchKrew(this.krewId);
    if (this.krew) {
      this.nameInput.domElement.value = this.krew.name ?? "";
      this.descriptionTextArea.domElement.value =
        this.krew.metadata?.description ?? "";
    }
  }

  private async updateKrew() {
    this.saveButton.title = el(".loading-spinner");

    try {
      await KrewService.updateKrew(
        this.krewId,
        this.nameInput.domElement.value,
        this.descriptionTextArea.domElement.value,
        this.krewImage,
      );
    } catch (e) {
      console.error(e);
    }

    if (!this.deleted) this.delete();
  }
}
