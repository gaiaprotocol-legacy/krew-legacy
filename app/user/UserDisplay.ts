import { DomNode, el, Tabs } from "common-app-module";
import { PreviewUserPublic, SoFiUserPublic } from "sofi-module";
import UserCommentPostList from "./user-display/user-posts/UserCommentPostList.js";
import UserLikedPostList from "./user-display/user-posts/UserLikedPostList.js";
import UserPostList from "./user-display/user-posts/UserPostList.js";
import UserRepostList from "./user-display/user-posts/UserRepostList.js";
import UserProfile from "./user-display/UserProfile.js";

export default class UserDisplay extends DomNode {
  private postsRendered = false;

  private userProfile: UserProfile;
  private postsContainer: DomNode;

  private postTabs: Tabs | undefined;
  private userPostList: UserPostList | undefined;
  private userCommentPostList: UserCommentPostList | undefined;
  private userRepostList: UserRepostList | undefined;
  private userLikedPostList: UserLikedPostList | undefined;

  constructor(
    user: SoFiUserPublic | undefined,
    previewUser?: PreviewUserPublic,
    displayClaimableFee = false,
  ) {
    super(".user-display");
    if (!user && previewUser) {
      user = {
        ...previewUser,
        total_earned_trading_fees: "0",
        follower_count: 0,
        following_count: 0,
        blocked: false,
        created_at: "-infinity",
      };
    }
    this.append(
      this.userProfile = new UserProfile(user, displayClaimableFee),
      this.postsContainer = el(".posts-container"),
    );
    if (previewUser) this.renderPosts(previewUser.user_id);
  }

  public async updateUser(user: SoFiUserPublic | undefined) {
    this.userProfile.updateUser(user);
    if (user) this.renderPosts(user.user_id);
  }

  private async renderPosts(userId: string) {
    if (this.postsRendered) return;
    this.postsRendered = true;

    this.postsContainer.empty().append(
      this.postTabs = new Tabs("user-posts", [
        { id: "user-posts", label: "Posts" },
        { id: "user-replies", label: "Replies" },
        { id: "user-reposts", label: "Reposts" },
        { id: "user-likes", label: "Likes" },
      ]),
      this.userPostList = new UserPostList(userId),
      this.userCommentPostList = new UserCommentPostList(userId),
      this.userRepostList = new UserRepostList(userId),
      this.userLikedPostList = new UserLikedPostList(userId),
    );

    this.postTabs.on("select", (id: string) => {
      [
        this.userPostList,
        this.userCommentPostList,
        this.userRepostList,
        this.userLikedPostList,
      ]
        .forEach((list) => list?.hide());
      if (id === "user-posts") this.userPostList?.show();
      else if (id === "user-replies") this.userCommentPostList?.show();
      else if (id === "user-reposts") this.userRepostList?.show();
      else if (id === "user-likes") this.userLikedPostList?.show();
    }).init();
  }
}