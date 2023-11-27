import { RealtimeChannel } from "@supabase/supabase-js";
import { msg, Supabase } from "common-app-module";
import { ChatMessageList, Message } from "sofi-module";
import KrewChatMessageInteractions from "../chat/KrewChatMessageInteractions.js";
import KrewLoadingAnimation from "../KrewLoadingAnimation.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import TopicChatMessageService from "./TopicChatMessageService.js";

export default class TopicChatMessageList extends ChatMessageList {
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
        (payload: any) => {
          console.log(payload);
        },
      )
      .subscribe();
  }

  protected async fetchMessages(): Promise<Message[]> {
    return await TopicChatMessageService.fetchMessages(this.topic);
  }

  public delete() {
    this.channel.unsubscribe();
    super.delete();
  }
}
