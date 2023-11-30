import { DateUtil, el, msg, Router } from "common-app-module";
import { NotificationListItem } from "sofi-module";
import KrewNotification, {
  KrewNotificationType,
} from "../database-interface/KrewNotification.js";
import KrewPost from "../database-interface/KrewPost.js";

export default class KrewNotificationListItem
  extends NotificationListItem<KrewNotificationType> {
  constructor(notification: KrewNotification, post: KrewPost | undefined) {
    super(".krew-notification-list-item", notification);

    const name = `<b>${notification.triggerer.display_name}</b>`;
    const titleDisplay = el("h3");
    const dateDisplay = el(".date", DateUtil.fromNow(notification.created_at));

    if (notification.type === KrewNotificationType.BUY_KEY) {
      titleDisplay.domElement.innerHTML = msg("notification-message-buy-key", {
        name,
        amount: notification.amount,
      });
      this.addClass("buy-key").append(el("main", titleDisplay, dateDisplay));
    } else if (notification.type === KrewNotificationType.SELL_KEY) {
      titleDisplay.domElement.innerHTML = msg("notification-message-sell-key", {
        name,
        amount: notification.amount,
      });
      this.addClass("sell-key").append(el("main", titleDisplay, dateDisplay));
    } else if (notification.type === KrewNotificationType.FOLLOW) {
      titleDisplay.domElement.innerHTML = msg("notification-message-follow", {
        name,
      });
      this.addClass("follow").append(el("main", titleDisplay, dateDisplay));
    } else if (notification.type === KrewNotificationType.POST_LIKE) {
      titleDisplay.domElement.innerHTML = msg(
        "notification-message-post-like",
        {
          name,
        },
      );
      this.addClass("post-like").append(
        el("main", titleDisplay, el("p", post?.message), dateDisplay),
      ).onDom("click", () => Router.go(`/post/${post?.id}`));
    } else if (notification.type === KrewNotificationType.REPOST) {
      titleDisplay.domElement.innerHTML = msg("notification-message-repost", {
        name,
      });
      this.addClass("repost").append(
        el("main", titleDisplay, el("p", post?.message), dateDisplay),
      ).onDom("click", () => Router.go(`/post/${post?.id}`));
    } else if (notification.type === KrewNotificationType.POST_COMMENT) {
      titleDisplay.domElement.innerHTML = msg(
        "notification-message-post-comment",
        {
          name,
        },
      );
      this.addClass("post-comment").append(
        el("main", titleDisplay, el("p", post?.message), dateDisplay),
      ).onDom("click", () => Router.go(`/post/${post?.id}`));
    } else if (notification.type === KrewNotificationType.POST_TAG) {
      titleDisplay.domElement.innerHTML = msg("notification-message-post-tag", {
        name,
      });
      this.addClass("post-tag").append(
        el("main", titleDisplay, el("p", post?.message), dateDisplay),
      ).onDom("click", () => Router.go(`/post/${post?.id}`));
    }
  }
}
