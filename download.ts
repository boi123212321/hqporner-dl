import { createWriteStream, existsSync } from "fs";
import Axios from "axios";
import { SingleBar, Presets } from "cli-progress";

export async function downloadFile(url: string, file: string) {
  if (existsSync(file)) {
    console.warn(`\t${url} already exists, skipping...`);
    return;
  }

  console.error(`\tDownloading ${url} to ${file}...`);

  const downloadBar = new SingleBar({}, Presets.legacy);
  downloadBar.start(100, 0);

  const response = await Axios({
    url: url,
    method: "GET",
    responseType: "stream",
  });

  const writer = createWriteStream(file);

  const totalSize = response.headers["content-length"];
  let loaded = 0;

  response.data.on("data", (data: Buffer) => {
    loaded += Buffer.byteLength(data);
    const percent = ((loaded / totalSize) * 100).toFixed(0);
    downloadBar.update(+percent);
  });

  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  downloadBar.stop();
}
