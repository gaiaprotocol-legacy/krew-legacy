import { el, View, ViewParams } from "common-app-module";
import Layout from "../layout/Layout.js";
import MaterialIcon from "../MaterialIcon.js";
import PostPopup from "./PostPopup.js";

export default class PostsView extends View {
  constructor(params: ViewParams) {
    super();
    Layout.append(
      this.container = el(
        ".posts-view",
        el("button.post", new MaterialIcon("add"), {
          click: () => new PostPopup(),
        }),
      ),
    );
  }
}
