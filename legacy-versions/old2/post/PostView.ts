import { el, View, ViewParams } from "@common-module/app";
import KrewPost from "../database-interface/KrewPost.js";
import Layout from "../layout/Layout.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import KrewPostDisplay from "./KrewPostDisplay.js";
import KrewPostService from "./KrewPostService.js";

export default class PostView extends View {
  private postDisplay: KrewPostDisplay | undefined;
  private lastCommentId: number | undefined;

  constructor(params: ViewParams, uri: string, data?: any) {
    super();
    Layout.append(this.container = el(".post-view"));
    this.render(parseInt(params.postId!), data);
  }

  public changeParams(params: ViewParams, uri: string, data?: any): void {
    this.render(parseInt(params.postId!), data);
  }

  private async render(postId: number, previewPost?: KrewPost) {
    this.container.empty().append(
      this.postDisplay = new KrewPostDisplay(postId, previewPost),
    );

    const data = await KrewPostService.fetchPost(
      postId,
      undefined,
      KrewSignedUserManager.user?.user_id,
    );

    this.postDisplay.data = data;
    this.lastCommentId = data.posts[data.posts.length - 1]?.id;
  }
}
