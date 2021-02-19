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
console.error(`Base folder: ${resolve(baseFolder)}`);

if (!existsSync(baseFolder)) {
  mkdirSync(baseFolder, { recursive: true });
}

async function domFromUrl(url: string) {
  console.error("Getting " + url);
  const { data } = await Axios.get(url);
  return cheerio.load(data);
}

async function processUrl(url: string) {
  const $ = await domFromUrl(url);

  const iframeUrl = $("#playerWrapper iframe").toArray()[0]?.attribs.src;

  if (!iframeUrl) {
    console.error("Iframe URL not found");
    process.exit(1);
  }

  const videoName = $(
    new URL(url).hostname.startsWith("m.") ? "h1" : "h1.main-h1"
  )
    .text()
    .trim();
  console.error(`Found video: ${videoName}`);
  const splits = iframeUrl.split("/").filter(Boolean);
  const videoId = splits[splits.length - 1];
  console.error(`ID: ${videoId}`);

  const $iframe = await domFromUrl(`https:${iframeUrl}`);

  const qualityRegex = new RegExp(
    `href=['"][a-zA-Z\/0-9.]+${argv.quality}\.mp4['"]`
  );
  const matches = $iframe.xml().match(qualityRegex);

  if (matches && matches.length) {
    const matchedStr = matches[0];
    const cleanUrl = `https:${matchedStr.slice(6, -1)}`;

    if (argv.dry) {
      const res = await Axios.head(cleanUrl);
      const size = parseInt(res.headers["content-length"]);
      console.log(
        JSON.stringify(
          {
            id: videoId,
            name: videoName,
            url: cleanUrl,
            size,
            sizeFormatted: `${Math.round(size / 1000 / 1000)} MB`,
          },
          null,
          2
        )
      );
    } else {
      const filePath = resolve(baseFolder, `${videoName}-${argv.quality}p.mp4`);
      await downloadFile(cleanUrl, filePath);
    }
  } else {
    console.error(`Quality ${argv.quality}p not found for ${videoId}`);
  }
}

(async () => {
  const skipped: string[] = [];

  for (const url of urls) {
    try {
      await processUrl(url);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error on ${url}: ${error.message}`);
      } else {
        console.error(error);
      }
      skipped.push(url);
    }
  }

  if (skipped.length) {
    console.error("Skipped", skipped);
  }

  process.exit(0);
})();
