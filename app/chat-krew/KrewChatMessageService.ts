import { Rich, UploadManager } from "@common-module/app";
import { MessageSelectQuery, MessageService } from "@common-module/social";
import KrewChatMessage from "../database-interface/KrewChatMessage.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";

class KrewChatMessageService extends MessageService<KrewChatMessage> {
  constructor() {
    super("krew_chat_messages", MessageSelectQuery, 100);
  }

  private async upload(files: File[]): Promise<Rich> {
    const rich: Rich = { files: [] };
    await Promise.all(files.map(async (file) => {
      if (KrewSignedUserManager.user) {
        const url = await UploadManager.uploadAttachment(
          "krew_chat_upload_files",
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

  public async sendMessage(krew: string, message: string, files: File[]) {
    const rich = files.length ? await this.upload(files) : undefined;
    return await this.safeInsertAndSelect({ krew, message, rich });
  }

  public async fetchMessages(krew: string) {
    return await this.safeSelect((b) =>
      b.eq("krew", krew).order("id", { ascending: false })
    );
  }
}

export default new KrewChatMessageService();
