import { ButtonType } from "common-app-module";
import { ChatMessageForm } from "sofi-module";
import MaterialIcon from "../MaterialIcon.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import LoginRequiredPopup from "../user/LoginRequiredPopup.js";
import KrewChatMessageService from "./KrewChatMessageService.js";

export default class KrewChatMessageForm extends ChatMessageForm {
  constructor(private krew: string) {
    super(".krew-chat-message-form");
    this.sendButton.title = new MaterialIcon("send");
    this.sendButton.type = ButtonType.Text;
  }

  protected async sendMessage(message: string, files: File[]) {
    if (!KrewSignedUserManager.signed) {
      new LoginRequiredPopup();
      throw new Error("You must be signed in to send messages");
    }
    const data = await KrewChatMessageService.sendMessage(
      this.krew,
      message,
      files,
    );
    return data.id;
  }
}
