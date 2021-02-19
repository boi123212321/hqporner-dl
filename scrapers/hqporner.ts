import { domFromUrl } from "../util";
import { IVideoScraper } from "./index";
import argv from "../args";
import Axios from "axios";

export class HQPornerScraper implements IVideoScraper {
  url = "hqporner.com";

  async scrapeUrl(url: string) {
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

      const res = await Axios.head(cleanUrl);
      const size = parseInt(res.headers["content-length"]);

      return {
        id: videoId,
        name: videoName,
        fileUrl: cleanUrl,
        size,
      };
    } else {
      throw new Error(`Quality ${argv.quality}p not found for ${url}`);
    }
  }
}
