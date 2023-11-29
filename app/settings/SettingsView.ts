import { el, View } from "common-app-module";
import Layout from "../layout/Layout.js";

export default class SettingsView extends View {
  constructor() {
    super();
    Layout.append(
      this.container = el(".settings-view"),
    );
  }
}
