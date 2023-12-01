import { el, View } from "common-app-module";
import Layout from "../layout/Layout.js";

export default class EditKrewView extends View {
  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".edit-krew-view",
        el("h1", "Edit Krew"),
      ),
    );
  }
}
