import { ViewParams } from "common-app-module";
import ChatRoomView from "../chat/ChatRoomView.js";
import ChatMessageSource from "../database-interface/ChatMessageSource.js";
import Krew from "../database-interface/Krew.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import KrewChatMessageForm from "./KrewChatMessageForm.js";
import KrewChatMessageList from "./KrewChatMessageList.js";
import KrewChatRoomHeader from "./KrewChatRoomHeader.js";

export default class KrewChatRoomView extends ChatRoomView {
  constructor(params: ViewParams, uri: string, data?: any) {
    super(".krew-chat-room-view");
    this.render(`${params.t}_${params.krewId}`, data);
  }

  public changeParams(params: ViewParams, uri: string, data?: any): void {
    this.render(`${params.t}_${params.krewId}`, data);
  }

  private async render(krew: string, previewKrew?: Krew) {
    const header = new KrewChatRoomHeader(krew, previewKrew);
    const list = new KrewChatMessageList(krew);
    const form = new KrewChatMessageForm(krew);

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
