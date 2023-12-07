import { Component, Popup, Router } from "common-app-module";
import KrewType from "../database-interface/KrewType.js";
import CreateKrewForm from "./CreateKrewForm.js";
import EditKrewPopup from "./EditKrewPopup.js";

export default class CreateKrewPopup extends Popup {
  private form: CreateKrewForm;

  constructor() {
    super({ barrierDismissible: true });

    this.append(
      new Component(
        ".popup.create-krew-popup",
        this.form = new CreateKrewForm(),
      ),
    );

    this.form.on("krewCreated", (krewId) => {
      new EditKrewPopup(krewId);
      this.delete();
    });
  }
}
