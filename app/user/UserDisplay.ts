import { DomNode, el, msg, Tabs } from "@common-module/app";
import { PreviewUserPublic, SoFiUserPublic } from "@common-module/social";
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
    xUsername: string,
    previewUser: PreviewUserPublic | undefined,
    feeClaimable: boolean,
  ) {
    super(".user-display");
    this.append(
      this.userProfile = new UserProfile(
        xUsername,
        previewUser,
        feeClaimable,
      ),
      this.postsContainer = el(".posts-container"),
    );
    if (previewUser) this.renderPosts(previewUser.user_id);
  }

  public set user(user: SoFiUserPublic | undefined) {
    this.userProfile.user = user;
    if (user) this.renderPosts(user.user_id);
  }

  private async renderPosts(userId: string) {
    if (this.postsRendered) return;
    this.postsRendered = true;

    this.postsContainer.empty().append(
      this.postTabs = new Tabs("user-posts", [
        { id: "user-posts", label: msg("user-display-posts-tab") },
        { id: "user-comments", label: msg("user-display-comments-tab") },
        { id: "user-reposts", label: msg("user-display-reposts-tab") },
        { id: "user-liked-posts", label: msg("user-display-liked-posts-tab") },
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
      else if (id === "user-comments") this.userCommentPostList?.show();
      else if (id === "user-reposts") this.userRepostList?.show();
      else if (id === "user-liked-posts") this.userLikedPostList?.show();
    }).init();
  }
}
