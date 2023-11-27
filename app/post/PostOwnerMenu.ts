import { Confirm, DropdownMenu, msg } from "common-app-module";
import KrewPostService from "./KrewPostService.js";

export default class PostOwnerMenu extends DropdownMenu {
  constructor(postId: number, options: {
    left: number;
    top: number;
  }) {
    super({
      left: options.left,
      top: options.top,
      items: [{
        title: msg("post-owner-menu-delete-button"),
        click: () => {
          new Confirm({
            title: msg("delete-post-confirm-title"),
            message: msg("delete-post-confirm-message"),
            confirmTitle: msg("delete-post-confirm-delete-button"),
            loadingTitle: msg("delete-post-confirm-deleting-button"),
          }, () => KrewPostService.deleteMessage(postId));
        },
      }],
    });
  }
}
