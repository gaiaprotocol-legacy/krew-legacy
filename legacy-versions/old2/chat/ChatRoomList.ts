import { DomNode, Store } from "@common-module/app";

export interface ChatRoomListOptions {
  storeName: string;
  emptyMessage: string;
}

export default abstract class ChatRoomList extends DomNode {
  protected store: Store;

  constructor(tag: string, options: ChatRoomListOptions) {
    super(tag + ".chat-room-list");
    this.store = new Store(options.storeName);
    this.domElement.setAttribute("data-empty-message", options.emptyMessage);
  }
}
