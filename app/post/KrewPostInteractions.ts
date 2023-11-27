import { Router } from "common-app-module";
import { Author, PostInteractions } from "sofi-module";
import KrewPost from "../database-interface/KrewPost.js";
import KrewPostService from "./KrewPostService.js";
import PostCommentPopup from "./PostCommentPopup.js";
import PostOwnerMenu from "./PostOwnerMenu.js";

class KrewPostInteractions implements PostInteractions<KrewPost> {
  public openPostView(postId: number) {
    Router.go(`/post/${postId}`);
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
    new PostCommentPopup(post);
  }

  public async repost(postId: number) {
    await KrewPostService.repost(postId);
  }

  public async unrepost(postId: number) {
    await KrewPostService.unrepost(postId);
  }

  public async like(postId: number) {
    await KrewPostService.like(postId);
  }

  public async unlike(postId: number) {
    await KrewPostService.unlike(postId);
  }
}

export default new KrewPostInteractions();
