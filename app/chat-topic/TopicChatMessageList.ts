import { RealtimeChannel } from "@supabase/supabase-js";
import { msg, Supabase } from "@common-module/app";
import { ChatMessageList } from "sofi-module";
import KrewChatMessageInteractions from "../chat/KrewChatMessageInteractions.js";
import ChatMessageSource from "../database-interface/ChatMessageSource.js";
import TopicChatMessage from "../database-interface/TopicChatMessage.js";
import KrewLoadingAnimation from "../KrewLoadingAnimation.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import TopicChatMessageService from "./TopicChatMessageService.js";

export default class TopicChatMessageList
  extends ChatMessageList<ChatMessageSource> {
  private channel: RealtimeChannel;

  constructor(private topic: string) {
    super(
      ".topic-chat-message-list",
      {
        storeName: `topic-${topic}-chat-messages`,
        signedUserId: KrewSignedUserManager.user?.user_id,
        emptyMessage: msg("chat-message-list-empty-message"),
      },
      KrewChatMessageInteractions,
      new KrewLoadingAnimation(),
    );

    this.channel = Supabase.client
      .channel(`topic-${topic}-chat-message-changes`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "topic_chat_messages",
          filter: "topic=eq." + topic,
        },
        // The response indicating that a message has been sent arrives before the real-time message itself.
        async (payload: any) => {
          const message = await TopicChatMessageService.fetchMessage(
            payload.new.id,
          );
          if (message) this.addNewMessage(message);
        },
      )
      .subscribe();
  }

  protected async fetchMessages(): Promise<TopicChatMessage[]> {
    return await TopicChatMessageService.fetchMessages(this.topic);
  }

  public delete() {
    this.channel.unsubscribe();
    super.delete();
  }
}
