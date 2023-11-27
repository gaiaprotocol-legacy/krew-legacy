import { msg, Router, Snackbar } from "common-app-module";
import { PostForm } from "sofi-module";
import KrewPost, { PostTarget } from "../database-interface/KrewPost.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import KrewPostService from "./KrewPostService.js";

export default class KrewPostForm extends PostForm {
  public target: number = PostTarget.EVERYONE;

  constructor(
    private parentPostId?: number,
    focus?: boolean,
    private callback?: (post: KrewPost) => void,
  ) {
    super(KrewSignedUserManager.user?.profile_image_thumbnail ?? "", focus);
  }

  protected async post(message: string, files: File[]): Promise<void> {
    const post = !this.parentPostId
      ? await KrewPostService.post(this.target, message, files)
      : await KrewPostService.comment(this.parentPostId, message, files);

    new Snackbar({
      message: msg("post-form-posted-snackbar-message"),
      action: {
        title: msg("post-form-posted-snackbar-button"),
        click: () => Router.go(`/post/${post.id}`),
      },
    });

    if (this.callback) this.callback(post);
  }
}
