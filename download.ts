import { createWriteStream, existsSync } from "fs";
import Axios from "axios";
import { SingleBar, Presets } from "cli-progress";
import { cyan } from "chalk";

function downloadSpeed(bytes: number, secs: number) {
  return bytes / secs;
}

export async function downloadFile(url: string, file: string) {
  if (existsSync(file)) {
    console.warn(`\t${url} already exists, skipping...`);
    return;
  }

  console.error(`\tDownloading ${url} to ${file}...`);

  const downloadBar = new SingleBar(
    {
      format: `Fetching |${cyan(
        "{bar}"
      )}| {percentage}% | {loaded}/{totalSize}MB | Speed: {speed}kB/s`,
    },
    Presets.shades_classic
  );
  downloadBar.start(100, 0, {
    percentage: "0",
    loaded: 0,
    totalSize: 0,
    speed: "N/A",
  });

  const response = await Axios({
    url: url,
    method: "GET",
    responseType: "stream",
  });

  const start = +new Date();

  const writer = createWriteStream(file);

  const totalSize = response.headers["content-length"];
  let loaded = 0;

  response.data.on("data", (data: Buffer) => {
    loaded += Buffer.byteLength(data);
    const percent = ((loaded / totalSize) * 100).toFixed(0);
    const bytesPerSec = downloadSpeed(loaded, (Date.now() - start) / 1000);
    downloadBar.update(parseInt(percent), {
      percentage: percent,
      loaded: (loaded / 1000 / 1000).toFixed(2),
      totalSize: (totalSize / 1000 / 1000).toFixed(2),
      speed: Math.round(bytesPerSec / 1000),
    });
  });

  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", (err) => {
      downloadBar.stop();
      reject();
    });
  });

  downloadBar.stop();
}
