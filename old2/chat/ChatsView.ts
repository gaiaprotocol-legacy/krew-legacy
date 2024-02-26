import { el, View } from "@common-module/app";
import KrewChatRoomList from "../chat-krew/KrewChatRoomList.js";
import TopicChatRoomList from "../chat-topic/TopicChatRoomList.js";
import Layout from "../layout/Layout.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import LoginRequiredDisplay from "../user/LoginRequiredDisplay.js";

export default class ChatsView extends View {
  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".chats-view",
        new TopicChatRoomList(),
        !KrewSignedUserManager.signed
          ? new LoginRequiredDisplay()
          : new KrewChatRoomList(),
      ),
    );
  }
}
