import { ViewParams } from "common-app-module";
import ChatRoomView from "../chat/ChatRoomView.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import TopicChatMessageForm from "./TopicChatMessageForm.js";
import TopicChatMessageList from "./TopicChatMessageList.js";
import TopicChatRoomHeader from "./TopicChatRoomHeader.js";

export default class TopicChatRoomView extends ChatRoomView {
  constructor(params: ViewParams) {
    super(".topic-chat-room-view");
    this.render(params.topic ?? "general");
  }

  public changeParams(params: ViewParams): void {
    this.render(params.topic ?? "general");
  }

  private async render(topic: string) {
    const header = new TopicChatRoomHeader(topic);
    const list = new TopicChatMessageList(topic);
    const form = new TopicChatMessageForm(topic);

    form.on(
      "messageSending",
      (tempId, message, files) => {
        if (KrewSignedUserManager.user) {
          list.messageSending(
            tempId,
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