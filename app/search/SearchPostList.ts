import { msg } from "@common-module/app";
import { PostList } from "sofi-module";
import KrewLoadingAnimation from "../KrewLoadingAnimation.js";
import KrewPost from "../database-interface/KrewPost.js";
import KrewPostInteractions from "../post/KrewPostInteractions.js";
import KrewPostService from "../post/KrewPostService.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";

export default class SearchPostList extends PostList<KrewPost> {
  constructor(private _query: string) {
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

  public set query(query: string) {
    this._query = query;
    this.lastPostId = undefined;
    this.refresh();
  }

  public get query(): string {
    return this._query;
  }

  protected async fetchPosts(): Promise<
    {
      fetchedPosts: { posts: KrewPost[]; mainPostId: number }[];
      repostedPostIds: number[];
      likedPostIds: number[];
    }
  > {
    if (KrewSignedUserManager.user?.wallet_address) {
      const result = await KrewPostService.findPosts(
        this.query,
        this.lastPostId,
        KrewSignedUserManager.user.user_id,
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
