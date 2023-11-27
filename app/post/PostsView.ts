import { el, View, ViewParams } from "common-app-module";
import Layout from "../layout/Layout.js";
import MaterialIcon from "../MaterialIcon.js";
import KrewPostForm from "./KrewPostForm.js";
import PostPopup from "./PostPopup.js";
import PostTargetSelector from "./PostTargetSelector.js";

export default class PostsView extends View {
  private targetSelector: PostTargetSelector;
  private form: KrewPostForm;

  constructor(params: ViewParams) {
    super();

    Layout.append(
      this.container = el(
        ".posts-view",
        el(
          ".form-container",
          this.targetSelector = new PostTargetSelector(),
          this.form = new KrewPostForm(),
        ),
        el("button.post", new MaterialIcon("add"), {
          click: () => new PostPopup(),
        }),
      ),
    );

    this.targetSelector.on(
      "change",
      (target: number) => this.form.target = target,
    );
  }
}
