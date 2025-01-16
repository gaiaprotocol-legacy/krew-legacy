import { el, Router } from "@common-module/app";
import { Topic } from "@common-module/social";
import ChatRoomListItem from "../chat/ChatRoomListItem.js";

export default class TopicChatRoomListItem extends ChatRoomListItem {
  constructor(topic: Topic) {
    super(".topic-chat-room-list-item", topic);
    this.append(
      el("h3", topic.topic),
      this.lastMessageDisplay,
    ).onDom(
      "click",
      () => Router.go(`/chat/${topic.topic}`),
    );
  }
}
