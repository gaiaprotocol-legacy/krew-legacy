import { msg } from "@common-module/app";
import { PostList } from "sofi-module";
import KrewLoadingAnimation from "../../../KrewLoadingAnimation.js";
import KrewPost from "../../../database-interface/KrewPost.js";
import KrewPostInteractions from "../../../post/KrewPostInteractions.js";
import KrewPostService from "../../../post/KrewPostService.js";
import KrewSignedUserManager from "../../KrewSignedUserManager.js";

export default class UserLikedPostList extends PostList<KrewPost> {
  private lastLikedAt: string | undefined;

  constructor(private userId: string) {
    super(
      ".user-liked-post-list",
      KrewPostService,
      {
        signedUserId: KrewSignedUserManager.user?.user_id,
        emptyMessage: msg("user-liked-post-list-empty-message"),
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
    const result = await KrewPostService.fetchLikedPosts(
      this.userId,
      this.lastLikedAt,
    );
    this.lastLikedAt = result.lastLikedAt;
    return {
      fetchedPosts: result.data.posts.map((p) => ({
        posts: [p],
        mainPostId: p.id,
      })),
      repostedPostIds: result.data.repostedPostIds,
      likedPostIds: result.data.likedPostIds,
    };
  }
}
