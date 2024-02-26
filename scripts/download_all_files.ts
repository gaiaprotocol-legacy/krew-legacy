import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import FileUtil from "./FileUtil.js";

const bucketName = "krew_images";

const supabase = createClient(
  "https://sfwnwiuxgehxbyystchq.supabase.co",
  process.env.SUPABASE_SERVICE_KEY!,
);

const { data: folders } = await supabase.storage.from(bucketName).list(
  undefined,
  {
    limit: 1000000,
  },
);

for (const folder of folders!) {
  const { data: files } = await supabase.storage.from(bucketName).list(
    folder.name,
  );
  for (const file of files!) {
    if (
      !(await FileUtil.checkFileExists(
        `./storage_backup/${bucketName}/${folder.name}`,
      ))
    ) {
      const result = await supabase.storage
        .from(bucketName)
        .download(folder.name + "/" + file.name);

      if (result.data) {
        await FileUtil.write(
          `./storage_backup/${bucketName}/${folder.name}/${file.name}`,
          Buffer.from(await result.data.arrayBuffer()),
        );
        console.log(`Downloaded ${bucketName}/${folder.name}/${file.name}`);
      }
    }
  }
}
