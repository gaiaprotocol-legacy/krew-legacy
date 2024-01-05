import ChatMessage from "@common-module/social/lib/database-interface/ChatMessage.js";
import ChatMessageSource from "./ChatMessageSource.js";

export default interface TopicChatMessage
  extends ChatMessage<ChatMessageSource> {
  topic: string;
}
