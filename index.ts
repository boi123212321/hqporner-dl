import argv from "./args";
import { downloadFile } from "./download";
import { baseFolder } from "./folder";
import { HQPornerScraper } from "./scrapers/hqporner";
import { resolve } from "path";
import { PorntrexScraper } from "./scrapers/porntrex";

const urls = argv._;

if (!urls.length) {
  console.error("Missing URLs: (ts-)node . <...urls>");
  process.exit(1);
}

const scrapers = [new HQPornerScraper(), new PorntrexScraper()];

async function processUrl(url: string) {
  console.error(`Processing ${url}`);
  const scraper = scrapers.find((s) => url.includes(s.url));

  if (scraper) {
    const data = await scraper.scrapeUrl(url);
    if (argv.dry) {
      console.log(
        JSON.stringify(
          {
            ...data,
            sizeFormatted: `${Math.round(data.size / 1000 / 1000)} MB`,
          },
          null,
          2
        )
      );
    } else {
      const filePath = resolve(baseFolder, `${data.name}-${argv.quality}p.mp4`);
      await downloadFile(data.fileUrl, filePath);
    }
  } else {
    console.error(`No scraper available for ${url}`);
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
