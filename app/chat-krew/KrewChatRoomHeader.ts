import { DomNode, el } from "common-app-module";
import MaterialIcon from "../MaterialIcon.js";
import Krew from "../database-interface/Krew.js";
import KrewService from "../krew/KrewService.js";
import KrewUtil from "../krew/KrewUtil.js";

export default class KrewChatRoomHeader extends DomNode {
  private title: DomNode;

  constructor(private krew: string, previewKrew?: Krew) {
    super(".krew-chat-room-header");
    this.append(
      el("button.back", new MaterialIcon("arrow_back"), {
        click: () => history.back(),
      }),
      this.title = el("h1", previewKrew ? KrewUtil.getName(previewKrew) : ""),
    );
    this.fetchKrew();
  }

  private async fetchKrew() {
    const krew = await KrewService.fetchKrew(this.krew);
    if (krew) this.title.text = KrewUtil.getName(krew);
  }
}
