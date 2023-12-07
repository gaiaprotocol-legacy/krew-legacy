import { Component, Popup } from "common-app-module";
import CreateKrewForm from "../krew/CreateKrewForm.js";
import EditKrewPopup from "../krew/EditKrewPopup.js";

export default class AddPopup extends Popup {
  private form: CreateKrewForm;

  constructor() {
    super({ barrierDismissible: true });

    this.append(
      new Component(
        ".popup.add-popup",
        this.form = new CreateKrewForm(),
      ),
    );

    this.form.on("krewCreated", (krewId) => {
      new EditKrewPopup(krewId);
      this.delete();
    });
  }
}
