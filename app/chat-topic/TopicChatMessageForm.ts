import { ButtonType } from "common-app-module";
import { ChatMessageForm } from "sofi-module";
import MaterialIcon from "../MaterialIcon.js";
import TopicChatMessageService from "./TopicChatMessageService.js";

export default class TopicChatMessageForm extends ChatMessageForm {
  constructor(private topic: string) {
    super(".topic-chat-message-form");
    this.sendButton.title = new MaterialIcon("send");
    this.sendButton.type = ButtonType.Text;
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
