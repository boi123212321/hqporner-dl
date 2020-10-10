import { downloadFile } from "./download";
import cheerio from "cheerio";
import Axios from "axios";
import { resolve } from "path";
import { existsSync, mkdirSync } from "fs";
import argv from "./args";

const urls = argv._;

if (!urls.length) {
  console.error("Missing URLs: (ts-)node . <...urls>");
  process.exit(1);
}

const baseFolder = argv.folder;
console.log(`Base folder: ${resolve(baseFolder)}`);

if (!existsSync(baseFolder)) {
  mkdirSync(baseFolder, { recursive: true });
}

async function domFromUrl(url: string) {
  console.log("Getting " + url);
  const { data } = await Axios.get(url);
  return cheerio.load(data);
}

(async () => {
  for (const url of urls) {
    const $ = await domFromUrl(url);

    const iframeUrl = $("iframe").toArray()[0]?.attribs.src;

    if (!iframeUrl) {
      console.error("Iframe URL not found");
      process.exit(1);
    }

    const splits = iframeUrl.split("/").filter(Boolean);
    const videoId = splits[splits.length - 1];

    const $iframe = await domFromUrl(`https:${iframeUrl}`);

    const qualityRegex = new RegExp(
      `href=['"][a-zA-Z\/0-9.]+${argv.quality}\.mp4['"]`
    );
    const matches = $iframe.xml().match(qualityRegex);

    if (matches && matches.length) {
      const matchedStr = matches[0];
      const cleanUrl = `https:${matchedStr.slice(6, -1)}`;

      const filePath = resolve(baseFolder, `${videoId}-${argv.quality}p.mp4`);

      await downloadFile(cleanUrl, filePath);
    } else {
      console.error(`Quality ${argv.quality}p not found for ${videoId}`);
    }
  }

  process.exit(0);
})();
