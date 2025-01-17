import { DomNode } from "@common-module/app";
import { PostThread } from "@common-module/social";
import KrewPost from "../database-interface/KrewPost.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import KrewPostForm from "./KrewPostForm.js";
import KrewPostInteractions from "./KrewPostInteractions.js";
import KrewPostService from "./KrewPostService.js";

export default class KrewPostDisplay extends DomNode {
  private thread: PostThread<KrewPost> | undefined;

  constructor(private postId: number, preview: KrewPost | undefined) {
    super(".post-display");
    if (preview) {
      this.append(
        this.thread = new PostThread(
          [preview],
          KrewPostService,
          {
            inView: true,
            mainPostId: preview.id,
            repostedPostIds: [],
            likedPostIds: [],
            newPostIds: [],
            signedUserId: KrewSignedUserManager.user?.user_id,
          },
          KrewPostInteractions,
          new KrewPostForm(
            postId,
            undefined,
            (post) => this.thread?.addComment(post),
          ),
        ),
      );
    }
  }

  public set data(data: {
    posts: KrewPost[];
    repostedPostIds: number[];
    likedPostIds: number[];
  }) {
    this.empty().append(
      this.thread = new PostThread(
        data.posts,
        KrewPostService,
        {
          inView: true,
          mainPostId: this.postId,
          repostedPostIds: data.repostedPostIds,
          likedPostIds: data.likedPostIds,
          newPostIds: [],
          signedUserId: KrewSignedUserManager.user?.user_id,
        },
        KrewPostInteractions,
        new KrewPostForm(
          this.postId,
          undefined,
          (post) => this.thread?.addComment(post),
        ),
      ),
    );
  }
}
