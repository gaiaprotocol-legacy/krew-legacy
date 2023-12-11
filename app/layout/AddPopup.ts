import { Component, el, msg, Popup, Tabs } from "common-app-module";
import CreateKrewForm from "../krew/CreateKrewForm.js";
import EditKrewPopup from "../krew/EditKrewPopup.js";
import MaterialIcon from "../MaterialIcon.js";
import NewPostForm from "../post/NewPostForm.js";

export default class AddPopup extends Popup {
  private content: Component;
  private tabs: Tabs;
  private krewForm: CreateKrewForm;
  private postForm: NewPostForm;

  constructor(initialTab?: string) {
    super({ barrierDismissible: true });

    this.append(
      this.content = new Component(
        ".popup.add-popup",
        el(
          "header",
          el("button.close", new MaterialIcon("close"), {
            click: () => this.delete(),
          }),
        ),
        this.tabs = new Tabs("add-popup", [{
          id: "krew",
          label: msg("add-popup-krew-tab"),
        }, {
          id: "post",
          label: msg("add-popup-post-tab"),
        }]),
        this.krewForm = new CreateKrewForm(),
        this.postForm = new NewPostForm(true, () => this.delete()),
      ),
    );

    this.krewForm.on("krewCreated", (krewId) => {
      new EditKrewPopup(krewId);
      this.delete();
    });

    this.tabs.on("select", (id: string) => {
      [
        this.krewForm,
        this.postForm,
      ].forEach((form) => form.hide());
      if (id === "krew") {
        this.content.addClass("krew");
        this.krewForm.show();
      } else {
        this.content.deleteClass("krew");
        if (id === "post") this.postForm.show();
      }
    }).init();
  }
}
