import { DomNode, el } from "common-app-module";

export default class TopicChatRoomHeader extends DomNode {
  constructor(topic: string) {
    super(".topic-chat-room-header");
    this.append(
      el("h1", topic),
    );
  }
}
