import { ViewParams } from "@common-module/app";
import ChatRoomView from "../chat/ChatRoomView.js";
import ChatMessageSource from "../database-interface/ChatMessageSource.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import TopicChatMessageForm from "./TopicChatMessageForm.js";
import TopicChatMessageList from "./TopicChatMessageList.js";
import TopicChatRoomHeader from "./TopicChatRoomHeader.js";

export default class TopicChatRoomView extends ChatRoomView {
  constructor(params: ViewParams) {
    super(".topic-chat-room-view");
    this.render(params.topic);
  }

  public changeParams(params: ViewParams): void {
    this.render(params.topic);
  }

  private render(topic: string | undefined) {
    this.container.deleteClass("mobile-hidden");
    if (!topic) this.container.addClass("mobile-hidden");
    topic = topic ? topic.toLowerCase() : "general";

    const header = new TopicChatRoomHeader(topic);
    const list = new TopicChatMessageList(topic);
    const form = new TopicChatMessageForm(topic);

    form.on(
      "messageSending",
      (tempId, message, files) => {
        if (KrewSignedUserManager.user) {
          list.messageSending(
            tempId,
            ChatMessageSource.Internal,
            KrewSignedUserManager.user,
            message,
            files,
          );
        }
      },
    );
    form.on("messageSent", (tempId, id) => list.messageSent(tempId, id));

    this.container.empty().append(header, list, form);
  }
}
