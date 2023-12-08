import { Router } from "common-app-module";
import { Author, PostInteractions } from "sofi-module";
import KrewPost from "../database-interface/KrewPost.js";
import PostCommentPopup from "./PostCommentPopup.js";
import PostOwnerMenu from "./PostOwnerMenu.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";

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
    if (KrewSignedUserManager.signed) new PostCommentPopup(post);
  }
}

export default new KrewPostInteractions();
