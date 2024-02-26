import { Component, el, Popup } from "@common-module/app";
import { Post, PostContentDisplay } from "@common-module/social";
import MaterialIcon from "../MaterialIcon.js";
import KrewPostForm from "./KrewPostForm.js";

export default class PostCommentPopup extends Popup {
  constructor(sourcePost: Post) {
    super({ barrierDismissible: true });

    this.append(
      new Component(
        ".popup.post-comment-popup",
        el(
          "header",
          el("button.close", new MaterialIcon("close"), {
            click: () => this.delete(),
          }),
        ),
        new PostContentDisplay(sourcePost),
        new KrewPostForm(sourcePost.id, true, () => this.delete()),
      ),
    );
  }
}
