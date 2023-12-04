import { msg } from "common-app-module";
import { PostList } from "sofi-module";
import KrewLoadingAnimation from "../KrewLoadingAnimation.js";
import KrewPost from "../database-interface/KrewPost.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import KrewPostInteractions from "./KrewPostInteractions.js";
import KrewPostService from "./KrewPostService.js";

export default class KeyHeldPostList extends PostList<KrewPost> {
  constructor() {
    super(
      ".key-held-post-list",
      KrewPostService,
      {
        signedUserId: KrewSignedUserManager.user?.user_id,
        emptyMessage: msg("key-held-post-list-empty-message"),
      },
      KrewPostInteractions,
      new KrewLoadingAnimation(),
    );
  }

  protected fetchPosts(): Promise<
    {
      fetchedPosts: { posts: KrewPost[]; mainPostId: number }[];
      repostedPostIds: number[];
      likedPostIds: number[];
    }
  > {
    throw new Error("Method not implemented.");
  }
}
