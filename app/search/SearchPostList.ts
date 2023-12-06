import { msg } from "common-app-module";
import { PostList } from "sofi-module";
import KrewLoadingAnimation from "../KrewLoadingAnimation.js";
import KrewPost from "../database-interface/KrewPost.js";
import KrewPostInteractions from "../post/KrewPostInteractions.js";
import KrewPostService from "../post/KrewPostService.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";

export default class SearchPostList extends PostList<KrewPost> {
  constructor() {
    super(
      ".search-post-list",
      KrewPostService,
      {
        signedUserId: KrewSignedUserManager.user?.user_id,
        emptyMessage: msg("search-post-list-empty-message"),
      },
      KrewPostInteractions,
      new KrewLoadingAnimation(),
    );
  }

  protected async fetchPosts(): Promise<
    {
      fetchedPosts: { posts: KrewPost[]; mainPostId: number }[];
      repostedPostIds: number[];
      likedPostIds: number[];
    }
  > {
    if (KrewSignedUserManager.user?.wallet_address) {
      const result = await KrewPostService.fetchKeyHeldPosts(
        KrewSignedUserManager.user.user_id,
        KrewSignedUserManager.user.wallet_address,
        this.lastPostId,
      );
      return {
        fetchedPosts: result.posts.map((p) => ({
          posts: [p],
          mainPostId: p.id,
        })),
        repostedPostIds: result.repostedPostIds,
        likedPostIds: result.likedPostIds,
      };
    } else {
      return {
        fetchedPosts: [],
        repostedPostIds: [],
        likedPostIds: [],
      };
    }
  }
}
