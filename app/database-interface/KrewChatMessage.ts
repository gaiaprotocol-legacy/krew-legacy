import { Message } from "sofi-module";

export default interface KrewChatMessage extends Message {
  krew: string;
}
