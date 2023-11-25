import { DomNode } from "common-app-module";

export default class Sidebar extends DomNode {
  constructor() {
    super(".sidebar");
    this.text = "Test";
  }
}
