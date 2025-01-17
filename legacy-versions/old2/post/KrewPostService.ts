import { Rich, Supabase, UploadManager } from "@common-module/app";
import { PostSelectQuery, PostService } from "@common-module/social";
import KrewPost from "../database-interface/KrewPost.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import LoginRequiredPopup from "../user/LoginRequiredPopup.js";

class KrewPostService extends PostService<KrewPost> {
  constructor() {
    super("posts", "reposts", "post_likes", PostSelectQuery, 50);
  }

  private async upload(files: File[]): Promise<Rich> {
    const rich: Rich = { files: [] };
    await Promise.all(files.map(async (file) => {
      if (KrewSignedUserManager.user) {
        const url = await UploadManager.uploadAttachment(
          "post_upload_files",
          KrewSignedUserManager.user.user_id,
          file,
          60 * 60 * 24 * 30,
        );
        rich.files?.push({
          url,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });
      }
    }));
    return rich;
  }

  public async post(
    target: number,
    krew: string | undefined,
    message: string,
    files: File[],
  ) {
    const rich = files.length ? await this.upload(files) : undefined;
    const data = await this.safeInsertAndSelect({
      target,
      krew,
      message,
      rich,
    });
    this.notifyNewGlobalPost(data);
    return data;
  }

  public async comment(parent: number, message: string, files: File[]) {
    const rich = files.length ? await this.upload(files) : undefined;
    return await this.safeInsertAndSelect({ parent, message, rich });
  }

  public async fetchKeyHeldPosts(
    userId: string,
    walletAddress: string,
    lastPostId?: number,
  ) {
    const { data, error } = await Supabase.client.rpc("get_key_held_posts", {
      p_user_id: userId,
      p_wallet_address: walletAddress,
      last_post_id: lastPostId,
      max_count: this.fetchLimit,
    });
    if (error) throw error;
    return this.enhancePostData(data ?? []);
  }

  public checkSigned() {
    if (!KrewSignedUserManager.signed) {
      new LoginRequiredPopup();
      throw new Error("User is not signed in.");
    }
  }
}

export default new KrewPostService();
