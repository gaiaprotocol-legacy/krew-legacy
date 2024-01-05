import { msg } from "@common-module/app";
import { PostList } from "sofi-module";
import KrewLoadingAnimation from "../../../KrewLoadingAnimation.js";
import KrewPost from "../../../database-interface/KrewPost.js";
import KrewPostInteractions from "../../../post/KrewPostInteractions.js";
import KrewPostService from "../../../post/KrewPostService.js";
import KrewSignedUserManager from "../../KrewSignedUserManager.js";

export default class UserRepostList extends PostList<KrewPost> {
  private lastRepostedAt: string | undefined;

  constructor(private userId: string) {
    super(
      ".user-repost-list",
      KrewPostService,
      {
        signedUserId: KrewSignedUserManager.user?.user_id,
        emptyMessage: msg("user-repost-list-empty-message"),
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
    const result = await KrewPostService.fetchReposts(
      this.userId,
      this.lastRepostedAt,
    );
    this.lastRepostedAt = result.lastRepostedAt;
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
