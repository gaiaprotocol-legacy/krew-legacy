import { ChatMessageForm } from "sofi-module";
import TopicChatMessageService from "./TopicChatMessageService.js";

export default class TopicChatMessageForm extends ChatMessageForm {
  constructor(private topic: string) {
    super(".topic-chat-message-form");
  }

  protected async sendMessage(message: string, files: File[]) {
    const data = await TopicChatMessageService.sendMessage(
      this.topic,
      message,
      files,
    );
    return data.id;
  }
}
