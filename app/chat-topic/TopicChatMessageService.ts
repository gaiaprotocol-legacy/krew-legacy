import { Rich, UploadManager } from "common-app-module";
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
        const url = await UploadManager.uploadImage(
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
    const data = await this.safeFetch<TopicChatMessage>((b) =>
      b.insert({ topic, message, rich }).select(this.selectQuery).single()
    );
    return data!;
  }

  public async fetchMessages(topic: string) {
    const data = await this.safeFetch<TopicChatMessage[]>((b) =>
      b.select(this.selectQuery).limit(this.fetchLimit).eq("topic", topic)
        .order("created_at", { ascending: false })
    );
    return data ?? [];
  }
}

export default new TopicChatMessageService();
