import { DomNode, el } from "common-app-module";
import Krew from "../database-interface/Krew.js";

export default class KrewChatRoomHeader extends DomNode {
  constructor(krew: string, previewKrew?: Krew) {
    super(".krew-chat-room-header");
    this.append(
      el("h1", previewKrew?.name),
    );
    //TODO:
  }
}
