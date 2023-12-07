import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  msg,
  Popup,
} from "common-app-module";
import PreviewKrew from "../database-interface/PreviewKrew.js";
import MaterialIcon from "../MaterialIcon.js";
import EditKrewPopup from "./EditKrewPopup.js";
import KrewUtil from "./KrewUtil.js";

export default class KrewPopup extends Popup {
  private editButton: DomNode;
  private holderCountDisplay: DomNode;
  private priceDisplay: DomNode;
  private balanceDisplay: DomNode;

  constructor(private krewId: string, previewKrew?: PreviewKrew) {
    super({ barrierDismissible: true });

    this.append(
      new Component(
        ".popup.krew-popup",
        el(
          "header",
          el(".krew-image", {
            style: {
              backgroundImage: `url(${previewKrew?.image})`,
            },
          }),
          el("h1", previewKrew ? KrewUtil.getName(previewKrew) : "..."),
          this.editButton = el("a.hidden", new MaterialIcon("edit"), {
            click: () => {
              new EditKrewPopup(krewId, previewKrew);
              this.delete();
            },
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
              this.holderCountDisplay = el(".value", "..."),
            ),
          ),
          el(
            "section.price",
            el(".icon-container", new MaterialIcon("sell")),
            el(
              ".metric",
              el("h3", "Price"),
              this.priceDisplay = el(".value", "..."),
            ),
          ),
        ),
        this.balanceDisplay = el(".balance", "..."),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel",
            click: () => this.delete(),
            title: msg("cancel-button"),
          }),
        ),
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
