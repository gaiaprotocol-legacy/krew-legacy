import { el, Router } from "common-app-module";
import { Author, ChatMessageInteractions } from "sofi-module";
import ChatMessageSource from "../database-interface/ChatMessageSource.js";

class KrewChatMessageInteractions
  implements ChatMessageInteractions<ChatMessageSource> {
  public openAuthorProfile(author: Author) {
    Router.go(`/${author.x_username}`, undefined, author);
  }

  public getSourceLabel(source: ChatMessageSource) {
    if (source === ChatMessageSource.Discord) {
      return el(
        ".source",
        "from ",
        el("a", "Discord", {
          href: "https://discord.gg/p2VhZAjyzP",
          target: "_blank",
        }),
      );
    } else if (source === ChatMessageSource.Telegram) {
      return el(
        ".source",
        "from ",
        el("a", "Telegram", {
          href: "https://t.me/krew_social",
          target: "_blank",
        }),
      );
    }
    return "";
  }
}

export default new KrewChatMessageInteractions();
