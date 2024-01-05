import { Rich, UploadManager } from "@common-module/app";
import { MessageSelectQuery, MessageService } from "sofi-module";
import TopicChatMessage from "../database-interface/TopicChatMessage.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";

class TopicChatMessageService extends MessageService<TopicChatMessage> {
  constructor() {
    super("topic_chat_messages", MessageSelectQuery, 100);
  }

  private async upload(files: File[]): Promise<Rich> {
    const rich: Rich = { files: [] };
    await Promise.all(files.map(async (file) => {
      if (KrewSignedUserManager.user) {
        const url = await UploadManager.uploadAttachment(
          "topic_chat_upload_files",
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

  public async sendMessage(topic: string, message: string, files: File[]) {
    const rich = files.length ? await this.upload(files) : undefined;
    return await this.safeInsertAndSelect({ topic, message, rich });
  }

  public async fetchMessages(topic: string) {
    return await this.safeSelect((b) =>
      b.eq("topic", topic).order("id", { ascending: false })
    );
  }
}

export default new TopicChatMessageService();
