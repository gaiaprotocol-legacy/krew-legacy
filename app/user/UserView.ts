import { el, View } from "common-app-module";
import Layout from "../layout/Layout.js";

export default class UserView extends View {
  constructor() {
    super();
    Layout.append(
      this.container = el(".user-view"),
    );
  }
}
