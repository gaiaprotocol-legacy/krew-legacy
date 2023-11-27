import { DateUtil, DomNode, el } from "common-app-module";

export default abstract class ChatRoomListItem extends DomNode {
  private _lastMessageDisplay?: DomNode;

  constructor(
    tag: string,
    private lastMessageData: {
      last_message?: string;
      last_message_sent_at: string;
    },
  ) {
    super(tag + ".chat-room-list-item");
  }

  protected get lastMessageDisplay() {
    this._lastMessageDisplay = el(".last-message-info");
    this.updateLastMessageData(this.lastMessageData);
    return this._lastMessageDisplay;
  }

  public updateLastMessageData(lastMessageData: {
    last_message?: string;
    last_message_sent_at: string;
  }) {
    this.lastMessageData = lastMessageData;
    this._lastMessageDisplay?.empty().append(
      el(".message", this.lastMessageData.last_message ?? ""),
      el(
        ".sent-at",
        this.lastMessageData.last_message_sent_at === "-infinity"
          ? ""
          : DateUtil.fromNow(this.lastMessageData.last_message_sent_at),
      ),
    );
  }
}
