import { RealtimeChannel } from "@supabase/supabase-js";
import { msg, Supabase } from "common-app-module";
import { ChatMessageList } from "sofi-module";
import KrewChatMessageInteractions from "../chat/KrewChatMessageInteractions.js";
import ChatMessageSource from "../database-interface/ChatMessageSource.js";
import KrewChatMessage from "../database-interface/KrewChatMessage.js";
import KrewLoadingAnimation from "../KrewLoadingAnimation.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import KrewChatMessageService from "./KrewChatMessageService.js";

export default class KrewChatMessageList
  extends ChatMessageList<ChatMessageSource> {
  private channel: RealtimeChannel;

  constructor(private krew: string) {
    super(
      ".krew-chat-message-list",
      {
        storeName: `krew-${krew}-chat-messages`,
        signedUserId: KrewSignedUserManager.user?.user_id,
        emptyMessage: msg("chat-message-list-empty-message"),
      },
      KrewChatMessageInteractions,
      new KrewLoadingAnimation(),
    );

    this.channel = Supabase.client
      .channel(`krew-${krew}-chat-message-changes`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "krew_chat_messages",
          filter: "krew=eq." + krew,
        },
        // The response indicating that a message has been sent arrives before the real-time message itself.
        async (payload: any) => {
          const message = await KrewChatMessageService.fetchMessage(
            payload.new.id,
          );
          if (message) this.addNewMessage(message);
        },
      )
      .subscribe();
  }

  protected async fetchMessages(): Promise<KrewChatMessage[]> {
    return await KrewChatMessageService.fetchMessages(this.krew);
  }

  public delete() {
    this.channel.unsubscribe();
    super.delete();
  }
}
