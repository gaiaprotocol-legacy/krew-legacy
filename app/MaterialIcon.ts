import { DomNode } from "common-app-module";

export default class MaterialIcon extends DomNode {
  constructor(iconName: string) {
    super("span.material-icon.material-symbols-outlined");
    this.text = iconName;
  }
}
