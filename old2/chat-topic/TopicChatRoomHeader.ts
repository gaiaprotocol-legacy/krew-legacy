import { DomNode, el } from "@common-module/app";
import MaterialIcon from "../MaterialIcon.js";

export default class TopicChatRoomHeader extends DomNode {
  constructor(topic: string) {
    super(".topic-chat-room-header");
    this.append(
      el("button.back", new MaterialIcon("arrow_back"), {
        click: () => history.back(),
      }),
      el("h1", topic),
    );
  }
}
