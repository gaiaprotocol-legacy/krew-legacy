import { msg } from "common-app-module";
import { PostList } from "sofi-module";
import KrewLoadingAnimation from "../../../KrewLoadingAnimation.js";
import KrewPost from "../../../database-interface/KrewPost.js";
import KrewPostInteractions from "../../../post/KrewPostInteractions.js";
import KrewPostService from "../../../post/KrewPostService.js";
import KrewSignedUserManager from "../../KrewSignedUserManager.js";

export default class UserRepostList extends PostList<KrewPost> {
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

  protected fetchPosts(): Promise<
    {
      fetchedPosts: { posts: KrewPost[]; mainPostId: number }[];
      repostedPostIds: number[];
      likedPostIds: number[];
    }
  > {
    console.log(this.userId);
    throw new Error("Method not implemented.");
  }
}
