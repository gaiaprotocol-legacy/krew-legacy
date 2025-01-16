import { Component, el, Popup } from "@common-module/app";
import MaterialIcon from "../MaterialIcon.js";
import CreateKrewForm from "./CreateKrewForm.js";
import EditKrewPopup from "./EditKrewPopup.js";

export default class CreateKrewPopup extends Popup {
  private form: CreateKrewForm;

  constructor() {
    super({ barrierDismissible: true });

    this.append(
      new Component(
        ".popup.create-krew-popup",
        el(
          "header",
          el("button.close", new MaterialIcon("close"), {
            click: () => this.delete(),
          }),
        ),
        this.form = new CreateKrewForm(),
      ),
    );

    this.form.on("krewCreated", (krewId) => {
      new EditKrewPopup(krewId);
      this.delete();
    });
  }
}
