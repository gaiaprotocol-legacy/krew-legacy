import { ButtonType } from "@common-module/app";
import { ChatMessageForm } from "@common-module/social";
import MaterialIcon from "../MaterialIcon.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import LoginRequiredPopup from "../user/LoginRequiredPopup.js";
import TopicChatMessageService from "./TopicChatMessageService.js";

export default class TopicChatMessageForm extends ChatMessageForm {
  constructor(private topic: string) {
    super(".topic-chat-message-form");
    this.sendButton.title = new MaterialIcon("send");
    this.sendButton.type = ButtonType.Text;
  }

  protected async sendMessage(message: string, files: File[]) {
    if (!KrewSignedUserManager.signed) {
      new LoginRequiredPopup();
      throw new Error("You must be signed in to send messages");
    }
    const data = await TopicChatMessageService.sendMessage(
      this.topic,
      message,
      files,
    );
    return data.id;
  }
}
