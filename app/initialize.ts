import {
  AppInitializer,
  el,
  MaterialIconSystem,
  msg,
  Router,
  SplashLoader,
  Store,
} from "common-app-module";
import {
  AuthUtil,
  inject_sofi_msg,
  TestChatView,
  TestPostListView,
  TestPostView,
} from "sofi-module";
import messages_en from "../locales/en.yml";
import messages_ja from "../locales/ja.yml";
import messages_zh from "../locales/zh.yml";
import messages_zh_HK from "../locales/zh_HK.yml";
import messages_zh_TW from "../locales/zh_TW.yml";
import ActivityView from "./activity/ActivityView.js";
import BlockTimeManager from "./BlockTimeManager.js";
import KrewChatRoomView from "./chat-krew/KrewChatRoomView.js";
import TopicChatRoomView from "./chat-topic/TopicChatRoomView.js";
import ChatsView from "./chat/ChatsView.js";
import Config from "./Config.js";
import KrewCommunalContract from "./contracts/KrewCommunalContract.js";
import KrewPersonalContract from "./contracts/KrewPersonalContract.js";
import EnvironmentManager from "./EnvironmentManager.js";
import ExploreView from "./explore/ExploreView.js";
import KrewService from "./krew/KrewService.js";
import MyKrewsView from "./krew/MyKrewsView.js";
import Layout from "./layout/Layout.js";
import NotificationsView from "./notification/NotificationsView.js";
import PostsView from "./post/PostsView.js";
import PostView from "./post/PostView.js";
import SearchView from "./search/SearchView.js";
import ProfileView from "./settings/ProfileView.js";
import SettingsView from "./settings/SettingsView.js";
import KrewSignedUserManager from "./user/KrewSignedUserManager.js";
import UserConnectionsView from "./user/user-connections/UserConnectionsView.js";
import UserView from "./user/UserView.js";
import WalletManager from "./wallet/WalletManager.js";
import WelcomeToKrewPopup from "./WelcomeToKrewPopup.js";

inject_sofi_msg();
msg.setMessages({
  en: messages_en,
  zh: messages_zh,
  "zh-tw": messages_zh_TW,
  "zh-hk": messages_zh_HK,
  ja: messages_ja,
});

MaterialIconSystem.launch();

export default async function initialize(config: Config) {
  AppInitializer.initialize(
    config.supabaseUrl,
    config.supabaseAnonKey,
    config.dev,
  );

  EnvironmentManager.messageForWalletLinking = config.messageForWalletLinking;
  EnvironmentManager.kromaRpc = config.kromaRpc;
  EnvironmentManager.kromaChainId = config.kromaChainId;

  WalletManager.init(config.walletConnectProjectId);
  KrewPersonalContract.init(config.krewPersonalAddress);
  KrewCommunalContract.init(config.krewCommunalAddress);

  await SplashLoader.load(el("img", { src: "/images/logo-transparent.png" }), [
    KrewSignedUserManager.fetchUserOnInit(),
    BlockTimeManager.init(),
  ]);

  Router.route("**", Layout, ["test/**"]);

  Router.route("", PostsView);
  Router.route("post/{postId}", PostView);

  Router.route(["chats", "chat/{topic}", "{t}/{krewId}"], ChatsView, [
    "post/{postId}",
    "{xUsername}/holding",
    "{xUsername}/following",
    "{xUsername}/followers",
  ]);
  Router.route(["chats", "chat/{topic}"], TopicChatRoomView);
  Router.route("{t}/{krewId}", KrewChatRoomView, [
    "chat/{topic}",
    "post/{postId}",
    "{xUsername}/holding",
    "{xUsername}/following",
    "{xUsername}/followers",
  ]);

  Router.route("explore", ExploreView);
  Router.route("search", SearchView);
  Router.route("activity", ActivityView);
  Router.route("notifications", NotificationsView);
  Router.route("profile", ProfileView);
  Router.route("settings", SettingsView);
  Router.route("my-krews", MyKrewsView);

  Router.route("{xUsername}", UserView, [
    "chats",
    "explore",
    "search",
    "activity",
    "notifications",
    "profile",
    "settings",
    "my-krews",
  ]);
  Router.route(
    [
      "{xUsername}/holding",
      "{xUsername}/holders",
      "{xUsername}/following",
      "{xUsername}/followers",
    ],
    UserConnectionsView,
  );

  Router.route("test/chat", TestChatView);
  Router.route("test/posts", TestPostListView);
  Router.route("test/post", TestPostView);

  AuthUtil.checkEmailAccess();

  const welcomeStore = new Store("welcome");
  if (
    !welcomeStore.get("skip") &&
    await KrewService.checkOwnedKrewsExist() !== true
  ) {
    new WelcomeToKrewPopup();
  }
}
