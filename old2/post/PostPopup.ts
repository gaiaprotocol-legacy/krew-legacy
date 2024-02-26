import { Component, el, Popup } from "@common-module/app";
import MaterialIcon from "../MaterialIcon.js";
import NewPostForm from "./NewPostForm.js";

export default class PostPopup extends Popup {
  constructor() {
    super({ barrierDismissible: true });

    this.append(
      new Component(
        ".popup.post-popup",
        el(
          "header",
          el("button.close", new MaterialIcon("close"), {
            click: () => this.delete(),
          }),
        ),
        new NewPostForm(true, () => this.delete()),
      ),
    );
  }
}
