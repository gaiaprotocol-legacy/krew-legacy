import { Message } from "sofi-module";

export default interface TopicChatMessage extends Message {
  topic: string;
}
