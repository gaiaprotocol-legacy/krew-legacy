import { Component, el, msg, Popup } from "common-app-module";
import { PostTarget } from "../database-interface/KrewPost.js";
import MaterialIcon from "../MaterialIcon.js";
import KrewPostForm from "./KrewPostForm.js";

export default class PostPopup extends Popup {
  private form: KrewPostForm;

  constructor() {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.post-popup",
        el(
          "header",
          el(
            "select",
            el("option", { value: String(PostTarget.EVERYONE) }, msg("post-target-everyone")),
            el(
              "option",
              { value: String(PostTarget.KEY_HOLDERS) },
              msg("post-target-key-holders"),
            ),
            {
              change: (event, select) =>
                this.form.target = Number(
                  (select.domElement as HTMLSelectElement).value,
                ),
            },
          ),
          el("button", new MaterialIcon("close"), {
            click: () => this.delete(),
          }),
        ),
        this.form = new KrewPostForm(undefined, true, () => this.delete()),
      ),
    );
  }
}
