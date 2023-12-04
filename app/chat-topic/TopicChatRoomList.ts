import { ListLoadingBar, msg } from "common-app-module";
import { Topic } from "sofi-module";
import ChatRoomList from "../chat/ChatRoomList.js";
import KrewTopicService from "../topic/KrewTopicService.js";
import TopicChatRoomListItem from "./TopicChatRoomListItem.js";

export default class TopicChatRoomList extends ChatRoomList {
  constructor() {
    super(".topic-chat-room-list", {
      storeName: "topic-chat-rooms",
      emptyMessage: msg("topic-chat-room-list-empty-message"),
    });

    const cachedTopics = this.store.get<Topic[]>("cached-topics");
    if (cachedTopics && cachedTopics.length > 0) {
      for (const t of cachedTopics) {
        this.append(new TopicChatRoomListItem(t));
      }
    }

    this.refresh();
  }

  private async refresh() {
    this.append(new ListLoadingBar());

    const topics = await KrewTopicService.fetchGlobalTopics();
    this.store.set("cached-topics", topics, true);

    if (!this.deleted) {
      this.empty();
      for (const t of topics) {
        this.append(new TopicChatRoomListItem(t));
      }
    }
  }
}
