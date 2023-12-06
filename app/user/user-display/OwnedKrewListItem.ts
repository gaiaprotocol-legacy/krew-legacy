import { DomNode, el } from "common-app-module";
import Krew from "../../database-interface/Krew.js";
import BuyKeyPopup from "../../key/BuyKeyPopup.js";
import KrewUtil from "../../krew/KrewUtil.js";

export default class OwnedKrewListItem extends DomNode {
  constructor(krew: Krew, feeClaimable: boolean) {
    super(".owned-krew-list-item");
    this.append(
      el("h1", KrewUtil.getName(krew)),
      el("a", "buy", {
        click: () => new BuyKeyPopup(krew),
      }),
    );
  }
}
