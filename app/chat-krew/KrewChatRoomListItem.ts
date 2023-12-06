import { el, Router } from "common-app-module";
import ChatRoomListItem from "../chat/ChatRoomListItem.js";
import Krew from "../database-interface/Krew.js";

export default class KrewChatRoomListItem extends ChatRoomListItem {
  constructor(krew: Krew) {
    super(".krew-chat-room-list-item", krew);
    this.append(
      el(".image", {
        style: {
          backgroundImage: `url(${krew.image_thumbnail})`,
        },
      }),
      el(
        ".info",
        el("h3", krew.name ?? "Untitled Krew"),
        this.lastMessageDisplay,
      ),
    ).onDom(
      "click",
      () =>
        Router.go(`/${krew.id.substring(0, 1)}/${krew.id.substring(2)}/chat`),
    );
  }
}
