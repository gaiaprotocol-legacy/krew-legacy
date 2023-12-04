import { el, View } from "common-app-module";
import Layout from "../layout/Layout.js";

export default class KeysView extends View {
  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".keys-view",
        el("h1", "Keys"),
      ),
    );
  }
}
