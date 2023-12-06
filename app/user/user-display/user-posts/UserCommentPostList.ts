import { msg } from "common-app-module";
import { PostList } from "sofi-module";
import KrewLoadingAnimation from "../../../KrewLoadingAnimation.js";
import KrewPost from "../../../database-interface/KrewPost.js";
import KrewPostInteractions from "../../../post/KrewPostInteractions.js";
import KrewPostService from "../../../post/KrewPostService.js";
import KrewSignedUserManager from "../../KrewSignedUserManager.js";

export default class UserCommentPostList extends PostList<KrewPost> {
  constructor(private userId: string) {
    super(
      ".user-comment-post-list",
      KrewPostService,
      {
        signedUserId: KrewSignedUserManager.user?.user_id,
        emptyMessage: msg("user-comment-post-list-empty-message"),
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
    const result = await KrewPostService.fetchUserCommentPosts(
      this.userId,
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
  }
}
