//import { Face, Network } from "@haechi-labs/face-sdk";
import {
  AppInitializer,
  AuthUtil,
  el,
  MaterialIconSystem,
  msg,
  RichDisplay,
  Router,
  SplashLoader,
  Store,
} from "@common-module/app";
import { inject_social_msg } from "@common-module/social";
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
import Env from "./Env.js";
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
import FaceWalletManager from "./wallet/FaceWalletManager.js";
import WalletConnectManager from "./wallet/WalletConnectManager.js";
import WelcomeToKrewPopup from "./WelcomeToKrewPopup.js";

inject_social_msg();
msg.setMessages({
  en: messages_en,
  zh: messages_zh,
  "zh-tw": messages_zh_TW,
  "zh-hk": messages_zh_HK,
  ja: messages_ja,
});

MaterialIconSystem.launch();

RichDisplay.NOT_FOUND_IMAGE = "/images/no-longer-available.jpg";

export default async function initialize(config: Config) {
  AppInitializer.initialize(
    config.supabaseUrl,
    config.supabaseAnonKey,
    config.dev,
  );

  Env.dev = config.dev;
  Env.messageForWalletLinking = config.messageForWalletLinking;
  Env.kromaRpc = config.kromaRpc;
  Env.kromaChainId = config.kromaChainId;

  FaceWalletManager.init(config.faceWalletApiKey);
  WalletConnectManager.init(config.walletConnectProjectId);
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

  AuthUtil.checkEmailAccess();

  const welcomeStore = new Store("welcome");
  if (
    !welcomeStore.get("skip") && KrewSignedUserManager.signed &&
    await KrewService.checkOwnedKrewsExist() !== true
  ) {
    new WelcomeToKrewPopup();
  }
}
