import { serveWithOptions } from "../_shared/cors.ts";
import supabase from "../_shared/supabase.ts";

serveWithOptions(async () => {
  const cutoffDate: Date = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago

  const targetBuckets = [
    "topic_chat_upload_files",
    "krew_chat_upload_files",
    "post_upload_files",
  ];

  for (const bucketName of targetBuckets) {
    const { data, error } = await supabase.storage.from(bucketName).list();
    if (error) throw error;
    if (data) {
      const filesToDelete: string[] = [];
      for (const file of data) {
        console.log(file);
        if (file.created_at) {
          const createdAt: Date = new Date(file.created_at);
          if (createdAt < cutoffDate) {
            filesToDelete.push(file.name);
          }
        }
      }

      console.log(filesToDelete);
      if (filesToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage.from(bucketName)
          .remove(filesToDelete);

        if (deleteError) {
          console.error("Error deleting files:", deleteError);
        } else {
          console.log(`Deleted old files: ${filesToDelete.join(", ")}`);
        }
      }
    }
  }
});
