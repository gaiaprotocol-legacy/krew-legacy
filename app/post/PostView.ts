import { el, View, ViewParams } from "common-app-module";
import KrewPost from "../database-interface/KrewPost.js";
import Layout from "../layout/Layout.js";

export default class PostView extends View {
  constructor(params: ViewParams, uri: string, data?: any) {
    super();
    Layout.append(
      this.container = el(
        ".post-view",
      ),
    );
    this.render(parseInt(params.postId!), data);
  }

  public changeParams(params: ViewParams, uri: string, data?: any): void {
    this.render(parseInt(params.postId!), data);
  }

  private async render(postId: number, previewPost?: KrewPost) {
    //TODO:
  }
}
