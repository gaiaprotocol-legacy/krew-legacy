import {
  AppInitializer,
  el,
  MaterialIconSystem,
  msg,
  Router,
  SplashLoader,
} from "common-app-module";
import {
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
import TopicChatRoomView from "./chat-topic/TopicChatRoomView.js";
import ChatsView from "./chat/ChatsView.js";
import Config from "./Config.js";
import KrewCommunalContract from "./contracts/KrewCommunalContract.js";
import KrewPersonalContract from "./contracts/KrewPersonalContract.js";
import EnvironmentManager from "./EnvironmentManager.js";
import Layout from "./layout/Layout.js";
import NotificationsView from "./notification/NotificationsView.js";
import PostsView from "./post/PostsView.js";
import KrewSignedUserManager from "./user/KrewSignedUserManager.js";
import WalletManager from "./wallet/WalletManager.js";

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
  ]);

  Router.route("**", Layout, ["test/**"]);
  Router.route("", PostsView);

  Router.route(["chats", "chat/{topic}"], ChatsView);
  Router.route(["chats", "chat/general"], TopicChatRoomView);
  //Router.route("chat/{krewId}", KrewChatRoomView, ["chat/general"]);
  Router.route("notifications", NotificationsView);

  Router.route("test/chat", TestChatView);
  Router.route("test/posts", TestPostListView);
  Router.route("test/post", TestPostView);
}
