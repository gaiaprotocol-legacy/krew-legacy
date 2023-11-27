import { Component, Popup } from "common-app-module";
import KrewPost from "../database-interface/KrewPost.js";

export default class PostCommentPopup extends Popup {
  constructor(parentPost: KrewPost) {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.post-comment-popup",
      ),
    );
  }
}
