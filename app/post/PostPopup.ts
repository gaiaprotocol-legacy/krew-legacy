import { Component, el, Popup } from "common-app-module";
import { PostTarget } from "../database-interface/KrewPost.js";
import KrewSelector from "../krew/KrewSelector.js";
import MaterialIcon from "../MaterialIcon.js";
import KrewPostForm from "./KrewPostForm.js";
import PostTargetSelector from "./PostTargetSelector.js";

export default class PostPopup extends Popup {
  private targetSelector: PostTargetSelector;
  private krewSelector: KrewSelector;
  private form: KrewPostForm;

  constructor() {
    super({ barrierDismissible: true });

    this.append(
      new Component(
        ".popup.post-popup",
        el(
          "header",
          this.targetSelector = new PostTargetSelector(),
          this.krewSelector = new KrewSelector().hide(),
          el("button.close", new MaterialIcon("close"), {
            click: () => this.delete(),
          }),
        ),
        this.form = new KrewPostForm(undefined, true, () => this.delete()),
      ),
    );

    this.targetSelector.on(
      "change",
      (target: number) => {
        this.form.target = target;
        if (target === PostTarget.KEY_HOLDERS) this.krewSelector.show();
        else this.form.krew = undefined;
      },
    );

    this.krewSelector.on(
      "change",
      (krew: string) => this.form.krew = krew,
    );
  }
}
