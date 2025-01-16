import { ListLoadingBar, msg } from "@common-module/app";
import ChatRoomList from "../chat/ChatRoomList.js";
import Krew from "../database-interface/Krew.js";
import KrewService from "../krew/KrewService.js";
import KrewChatRoomListItem from "./KrewChatRoomListItem.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";

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
    if (KrewSignedUserManager.user?.wallet_address) {
      this.append(new ListLoadingBar());

      const krews = await KrewService.fetchKeyHeldKrews(
        KrewSignedUserManager.user.wallet_address,
        undefined,
      );
      this.store.set("cached-krews", krews, true);

      if (!this.deleted) {
        this.empty();
        for (const k of krews) {
          this.append(new KrewChatRoomListItem(k));
        }
      }
    }
  }
}
