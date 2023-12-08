import { el, Tabs, View, ViewParams } from "common-app-module";
import { FollowingPostList, GlobalPostList } from "sofi-module";
import KrewPost, { PostTarget } from "../database-interface/KrewPost.js";
import KrewSelector from "../krew/KrewSelector.js";
import KrewLoadingAnimation from "../KrewLoadingAnimation.js";
import Layout from "../layout/Layout.js";
import MaterialIcon from "../MaterialIcon.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import KeyHeldPostList from "./KeyHeldPostList.js";
import KrewPostForm from "./KrewPostForm.js";
import KrewPostInteractions from "./KrewPostInteractions.js";
import KrewPostService from "./KrewPostService.js";
import PostPopup from "./PostPopup.js";
import PostTargetSelector from "./PostTargetSelector.js";

export default class PostsView extends View {
  private targetSelector: PostTargetSelector | undefined;
  private krewSelector: KrewSelector | undefined;
  private form: KrewPostForm | undefined;

  private tabs: Tabs | undefined;
  private globalPostList: GlobalPostList<KrewPost>;
  private followingPostList: FollowingPostList<KrewPost> | undefined;
  private keyHeldPostList: KeyHeldPostList | undefined;

  constructor(params: ViewParams) {
    super();

    Layout.append(
      this.container = el(
        ".posts-view",
        el(
          "main",
          KrewSignedUserManager.signed
            ? el(
              ".form-container",
              el(
                "header",
                this.targetSelector = new PostTargetSelector(),
                this.krewSelector = new KrewSelector().hide(),
              ),
              this.form = new KrewPostForm(),
            )
            : undefined,
          el(
            ".post-container",
            KrewSignedUserManager.signed
              ? this.tabs = new Tabs(
                "posts-view-tabs",
                KrewSignedUserManager.walletLinked
                  ? [
                    { id: "global", label: "Global" },
                    { id: "following", label: "Following" },
                    { id: "held", label: "Held" },
                  ]
                  : [
                    { id: "global", label: "Global" },
                    { id: "following", label: "Following" },
                  ],
              )
              : undefined,
            this.globalPostList = new GlobalPostList<KrewPost>(
              KrewPostService,
              {
                signedUserId: KrewSignedUserManager.user?.user_id,
                wait: true,
              },
              KrewPostInteractions,
              new KrewLoadingAnimation(),
            ),
            KrewSignedUserManager.signed
              ? this.followingPostList = new FollowingPostList(
                KrewPostService,
                {
                  signedUserId: KrewSignedUserManager.user?.user_id!,
                  wait: true,
                },
                KrewPostInteractions,
                new KrewLoadingAnimation(),
              )
              : undefined,
            KrewSignedUserManager.walletLinked
              ? this.keyHeldPostList = new KeyHeldPostList()
              : undefined,
          ),
        ),
        KrewSignedUserManager.signed
          ? el("button.post", new MaterialIcon("add"), {
            click: () => new PostPopup(),
          })
          : undefined,
      ),
    );

    this.targetSelector?.on(
      "change",
      (target: number) => {
        if (this.form) {
          this.form.target = target;
          if (target === PostTarget.KEY_HOLDERS) this.krewSelector?.show();
          else this.form.krew = undefined;
        }
      },
    );

    this.krewSelector?.on(
      "change",
      (krew: string) => {
        if (this.form) this.form.krew = krew;
      },
    );

    if (!this.tabs) {
      this.globalPostList.show();
    } else {
      this.tabs.on("select", (id: string) => {
        [this.globalPostList, this.followingPostList, this.keyHeldPostList]
          .forEach((list) => list?.hide());
        if (id === "global") this.globalPostList.show();
        else if (id === "following") this.followingPostList?.show();
        else if (id === "held") this.keyHeldPostList?.show();
      }).init();
    }
  }
}
