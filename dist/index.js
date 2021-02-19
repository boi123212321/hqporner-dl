"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const args_1 = __importDefault(require("./args"));
const download_1 = require("./download");
const folder_1 = require("./folder");
const hqporner_1 = require("./scrapers/hqporner");
const path_1 = require("path");
const porntrex_1 = require("./scrapers/porntrex");
const urls = args_1.default._;
if (!urls.length) {
    console.error("Missing URLs: (ts-)node . <...urls>");
    process.exit(1);
}
const scrapers = [new hqporner_1.HQPornerScraper(), new porntrex_1.PorntrexScraper()];
function processUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        console.error(`Processing ${url}`);
        const scraper = scrapers.find((s) => url.includes(s.url));
        if (scraper) {
            const data = yield scraper.scrapeUrl(url);
            if (args_1.default.dry) {
                console.log(JSON.stringify(Object.assign(Object.assign({}, data), { sizeFormatted: `${Math.round(data.size / 1000 / 1000)} MB` }), null, 2));
            }
            else {
                const filePath = path_1.resolve(folder_1.baseFolder, `${data.name}-${args_1.default.quality}p.mp4`);
                yield download_1.downloadFile(data.fileUrl, filePath);
            }
        }
        else {
            console.error(`No scraper available for ${url}`);
        }
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const skipped = [];
    for (const url of urls) {
        try {
            yield processUrl(url);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(`Error on ${url}: ${error.message}`);
            }
            else {
                console.error(error);
            }
            skipped.push(url);
        }
    }
    if (skipped.length) {
        console.error("Skipped", skipped);
    }
    process.exit(0);
}))();
