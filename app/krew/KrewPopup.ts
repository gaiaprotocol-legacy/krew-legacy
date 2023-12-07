import { Component, DomNode, el, Popup } from "common-app-module";
import PreviewKrew from "../database-interface/PreviewKrew.js";
import MaterialIcon from "../MaterialIcon.js";
import EditKrewPopup from "./EditKrewPopup.js";
import KrewUtil from "./KrewUtil.js";

export default class KrewPopup extends Popup {
  private editButton: DomNode;

  constructor(private krewId: string, previewKrew?: PreviewKrew) {
    super({ barrierDismissible: true });

    this.append(
      new Component(
        ".popup.krew-popup",
        el(
          "header",
          el(".krew-image", {
            style: {
              backgroundImage: `url(${previewKrew?.image_thumbnail})`,
            },
          }),
          el("h1", previewKrew ? KrewUtil.getName(previewKrew) : undefined),
          this.editButton = el("a.hidden", new MaterialIcon("edit"), {
            click: () => new EditKrewPopup(krewId, previewKrew),
          }),
        ),
        el(
          ".metric-container",
          el(
            "section.price",
            el(".icon-container", new MaterialIcon("group")),
            el(
              ".metric",
              el("h3", "Holders"),
              el(".value", "..."),
            ),
          ),
          el(
            "section.price",
            el(".icon-container", new MaterialIcon("sell")),
            el(
              ".metric",
              el("h3", "Price"),
              el(".value", "..."),
            ),
          ),
        ),
        el(".balance", "..."),
        el("footer"),
      ),
    );

    this.fetchKrew();
    this.fetchBalance();
  }

  private fetchKrew() {
    //TODO:
  }

  private fetchBalance() {
    //TODO:
  }
}
