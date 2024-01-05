import { DateUtil, el, msg, Router } from "@common-module/app";
import { NotificationListItem } from "@common-module/social";
import KrewNotification, {
  KrewNotificationType,
} from "../database-interface/KrewNotification.js";

export default class KrewNotificationListItem
  extends NotificationListItem<KrewNotificationType> {
  constructor(notification: KrewNotification) {
    super(".krew-notification-list-item", notification);

    const triggerer = `<b>${notification.triggerer?.display_name}</b>`;
    const titleDisplay = el("h3");
    const dateDisplay = el(".date", DateUtil.fromNow(notification.created_at));

    if (notification.type === KrewNotificationType.CREATE_KEY) {
      titleDisplay.domElement.innerHTML = msg(
        "notification-message-create-key",
        { krew_name: notification.krew?.name },
      );
      this.addClass("create-key").append(el("main", titleDisplay, dateDisplay))
        .onDom(
          "click",
          () =>
            Router.go(
              `/krew/${
                notification.krew?.id.startsWith("p_") ? "personal" : "communal"
              }/${notification.krew?.id.substring(2)}`,
            ),
        );
    } else if (notification.type === KrewNotificationType.BUY_KEY) {
      titleDisplay.domElement.innerHTML = msg("notification-message-buy-key", {
        triggerer,
        amount: notification.amount,
      });
      this.addClass("buy-key").append(el("main", titleDisplay, dateDisplay))
        .onDom(
          "click",
          () => Router.go(`/${notification.triggerer?.x_username}`),
        );
    } else if (notification.type === KrewNotificationType.SELL_KEY) {
      titleDisplay.domElement.innerHTML = msg("notification-message-sell-key", {
        triggerer,
        amount: notification.amount,
      });
      this.addClass("sell-key").append(el("main", titleDisplay, dateDisplay))
        .onDom(
          "click",
          () => Router.go(`/${notification.triggerer?.x_username}`),
        );
    } else if (notification.type === KrewNotificationType.FOLLOW) {
      titleDisplay.domElement.innerHTML = msg("notification-message-follow", {
        triggerer,
      });
      this.addClass("follow").append(el("main", titleDisplay, dateDisplay))
        .onDom(
          "click",
          () => Router.go(`/${notification.triggerer?.x_username}`),
        );
    } else if (notification.type === KrewNotificationType.POST_LIKE) {
      titleDisplay.domElement.innerHTML = msg(
        "notification-message-post-like",
        {
          triggerer,
        },
      );
      this.addClass("post-like").append(
        el(
          "main",
          titleDisplay,
          el("p", notification.post_message),
          dateDisplay,
        ),
      ).onDom("click", () => Router.go(`/post/${notification.post_id}`));
    } else if (notification.type === KrewNotificationType.REPOST) {
      titleDisplay.domElement.innerHTML = msg("notification-message-repost", {
        triggerer,
      });
      this.addClass("repost").append(
        el(
          "main",
          titleDisplay,
          el("p", notification.post_message),
          dateDisplay,
        ),
      ).onDom("click", () => Router.go(`/post/${notification.post_id}`));
    } else if (notification.type === KrewNotificationType.POST_COMMENT) {
      titleDisplay.domElement.innerHTML = msg(
        "notification-message-post-comment",
        {
          triggerer,
        },
      );
      this.addClass("post-comment").append(
        el(
          "main",
          titleDisplay,
          el("p", notification.post_message),
          dateDisplay,
        ),
      ).onDom("click", () => Router.go(`/post/${notification.post_id}`));
    } else if (notification.type === KrewNotificationType.POST_TAG) {
      titleDisplay.domElement.innerHTML = msg("notification-message-post-tag", {
        triggerer,
      });
      this.addClass("post-tag").append(
        el(
          "main",
          titleDisplay,
          el("p", notification.post_message),
          dateDisplay,
        ),
      ).onDom("click", () => Router.go(`/post/${notification.post_id}`));
    }
  }
}
