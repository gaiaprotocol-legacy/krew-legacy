import { DomNode, Router } from "@common-module/app";
import { Author, PostInteractions } from "@common-module/social";
import KrewPost from "../database-interface/KrewPost.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import LoginRequiredPopup from "../user/LoginRequiredPopup.js";
import PostCommentPopup from "./PostCommentPopup.js";
import PostOwnerMenu from "./PostOwnerMenu.js";

class KrewPostInteractions implements PostInteractions<KrewPost> {
  public openPostView(post: KrewPost) {
    Router.go(`/post/${post.id}`, undefined, post);
  }

  public openAuthorProfile(author: Author) {
    Router.go(`/${author.x_username}`, undefined, author);
  }

  public openOwnerMenu(postId: number, rect: DOMRect) {
    new PostOwnerMenu(postId, {
      left: rect.right - 160,
      top: rect.top,
    });
  }

  public openCommentPopup(post: KrewPost) {
    if (!KrewSignedUserManager.signed) {
      new LoginRequiredPopup();
    } else {
      new PostCommentPopup(post);
    }
  }

  public displayTarget(post: KrewPost): DomNode<HTMLElement> {
    throw new Error("Method not implemented.");
  }
}

export default new KrewPostInteractions();
