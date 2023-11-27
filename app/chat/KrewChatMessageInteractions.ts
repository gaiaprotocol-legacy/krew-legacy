import { Router } from "common-app-module";
import { Author, ChatMessageInteractions } from "sofi-module";

class KrewChatMessageInteractions implements ChatMessageInteractions {
  public openAuthorProfile(author: Author) {
    Router.go(`/${author.x_username}`, undefined, author);
  }
}

export default new KrewChatMessageInteractions();
