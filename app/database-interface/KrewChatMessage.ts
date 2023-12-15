import ChatMessage from "sofi-module/lib/database-interface/ChatMessage.js";
import ChatMessageSource from "./ChatMessageSource.js";

export default interface KrewChatMessage extends ChatMessage<ChatMessageSource> {
  krew: string;
}
