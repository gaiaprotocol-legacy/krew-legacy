import { ListLoadingBar, msg } from "common-app-module";
import ChatRoomList from "../chat/ChatRoomList.js";
import Krew from "../database-interface/Krew.js";
import KrewService from "../krew/KrewService.js";
import KrewChatRoomListItem from "./KrewChatRoomListItem.js";

export default class KrewChatRoomList extends ChatRoomList {
  constructor() {
    super(".krew-chat-room-list", {
      storeName: "krew-chat-rooms",
      emptyMessage: msg("krew-chat-room-list-empty-message"),
    });

    const cachedKrews = this.store.get<Krew[]>("cached-krews");
    if (cachedKrews && cachedKrews.length > 0) {
      for (const k of cachedKrews) {
        this.append(new KrewChatRoomListItem(k));
      }
    }

    this.refresh();
  }

  private async refresh() {
    this.append(new ListLoadingBar());

    const krews = await KrewService.fetchKeyHeldKrews(undefined);
    this.store.set("cached-krews", krews);

    if (!this.deleted) {
      this.empty();
      for (const k of krews) {
        this.append(new KrewChatRoomListItem(k));
      }
    }
  }
}
