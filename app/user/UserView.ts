import { DomNode, el, Tabs, View, ViewParams } from "common-app-module";
import { PreviewUserPublic } from "sofi-module";
import Layout from "../layout/Layout.js";
import KrewUserCacher from "./KrewUserCacher.js";
import KrewUserService from "./KrewUserService.js";
import UserCommentPostList from "./user-posts/UserCommentPostList.js";
import UserLikedPostList from "./user-posts/UserLikedPostList.js";
import UserPostList from "./user-posts/UserPostList.js";
import UserRepostList from "./user-posts/UserRepostList.js";
import UserDisplay from "./UserDisplay.js";
import UserPreviewDisplay from "./UserPreviewDisplay.js";

export default class UserView extends View {
  private userContainer: DomNode;
  private postsContainer: DomNode;

  private postTabs: Tabs | undefined;
  private userPostList: UserPostList | undefined;
  private userCommentPostList: UserCommentPostList | undefined;
  private userRepostList: UserRepostList | undefined;
  private userLikedPostList: UserLikedPostList | undefined;

  constructor(params: ViewParams, uri: string, data?: any) {
    super();
    Layout.append(
      this.container = el(
        ".user-view",
        this.userContainer = el(".user-container"),
        this.postsContainer = el(".posts-container"),
      ),
    );
    this.render(params.xUsername!, data);
  }

  public changeParams(params: ViewParams, uri: string, data?: any): void {
    this.render(params.xUsername!, data);
  }

  private async render(
    xUsername: string,
    previewUser?: PreviewUserPublic,
  ) {
    let postsRendered = false;
    this.postsContainer.empty();

    if (previewUser) {
      this.userContainer.empty().append(new UserPreviewDisplay(previewUser));
      this.renderPosts(previewUser.user_id);
      postsRendered = true;
    }

    const cached = KrewUserCacher.getByXUsername(xUsername);
    if (cached) {
      this.userContainer.empty().append(new UserDisplay(cached));
      if (!postsRendered) {
        this.renderPosts(cached.user_id);
        postsRendered = true;
      }
    }

    const user = await KrewUserService.fetchByXUsername(xUsername);
    if (user) {
      this.userContainer.empty().append(new UserDisplay(user));
      if (!postsRendered) {
        this.renderPosts(user.user_id);
        postsRendered = true;
      }
    }
  }

  private async renderPosts(userId: string) {
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
