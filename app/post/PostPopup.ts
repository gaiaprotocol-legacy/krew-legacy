import { Component, el, Popup } from "common-app-module";
import MaterialIcon from "../MaterialIcon.js";
import KrewPostForm from "./KrewPostForm.js";
import PostTargetSelector from "./PostTargetSelector.js";

export default class PostPopup extends Popup {
  private targetSelector: PostTargetSelector;
  private form: KrewPostForm;

  constructor() {
    super({ barrierDismissible: true });

    this.append(
      new Component(
        ".popup.post-popup",
        el(
          "header",
          this.targetSelector = new PostTargetSelector(),
          el("button.close", new MaterialIcon("close"), {
            click: () => this.delete(),
          }),
        ),
        this.form = new KrewPostForm(undefined, true, () => this.delete()),
      ),
    );

    this.targetSelector.on(
      "change",
      (target: number) => this.form.target = target,
    );
  }
}
