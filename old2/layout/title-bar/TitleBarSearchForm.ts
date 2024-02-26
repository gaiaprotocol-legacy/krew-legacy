import { DomNode, el, msg, Router } from "@common-module/app";
import MaterialIcon from "../../MaterialIcon.js";

export default class TitleBarSearchForm extends DomNode {
  private input: DomNode<HTMLInputElement>;

  constructor() {
    super("form.title-bar-search-form");
    this.append(
      el(
        "label",
        new MaterialIcon("search"),
        this.input = el("input", {
          placeholder: msg("title-bar-search-form-placeholder"),
          value: new URLSearchParams(location.search).get("q") ?? "",
        }),
      ),
    );
    this.onDom("submit", (event) => {
      event.preventDefault();
      Router.go(`/search?q=${this.input.domElement.value}`);
    });
  }

  public clear() {
    this.input.domElement.value = "";
  }
}
