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
const download_1 = require("./download");
const cheerio_1 = __importDefault(require("cheerio"));
const axios_1 = __importDefault(require("axios"));
const path_1 = require("path");
const fs_1 = require("fs");
const args_1 = __importDefault(require("./args"));
const urls = args_1.default._;
if (!urls.length) {
    console.error("Missing URLs: (ts-)node . <...urls>");
    process.exit(1);
}
const baseFolder = args_1.default.folder;
console.error(`Base folder: ${path_1.resolve(baseFolder)}`);
if (!fs_1.existsSync(baseFolder)) {
    fs_1.mkdirSync(baseFolder, { recursive: true });
}
function domFromUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        console.error("Getting " + url);
        const { data } = yield axios_1.default.get(url);
        return cheerio_1.default.load(data);
    });
}
function processUrl(url) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const $ = yield domFromUrl(url);
        const iframeUrl = (_a = $("#playerWrapper iframe").toArray()[0]) === null || _a === void 0 ? void 0 : _a.attribs.src;
        if (!iframeUrl) {
            console.error("Iframe URL not found");
            process.exit(1);
        }
        const videoName = $(new URL(url).hostname.startsWith("m.") ? "h1" : "h1.main-h1")
            .text()
            .trim();
        console.error(`Found video: ${videoName}`);
        const splits = iframeUrl.split("/").filter(Boolean);
        const videoId = splits[splits.length - 1];
        console.error(`ID: ${videoId}`);
        const $iframe = yield domFromUrl(`https:${iframeUrl}`);
        const qualityRegex = new RegExp(`href=['"][a-zA-Z\/0-9.]+${args_1.default.quality}\.mp4['"]`);
        const matches = $iframe.xml().match(qualityRegex);
        if (matches && matches.length) {
            const matchedStr = matches[0];
            const cleanUrl = `https:${matchedStr.slice(6, -1)}`;
            if (args_1.default.dry) {
                const res = yield axios_1.default.head(cleanUrl);
                const size = parseInt(res.headers["content-length"]);
                console.log(JSON.stringify({
                    id: videoId,
                    name: videoName,
                    url: cleanUrl,
                    size,
                    sizeFormatted: `${Math.round(size / 1000 / 1000)} MB`,
                }, null, 2));
            }
            else {
                const filePath = path_1.resolve(baseFolder, `${videoName}-${args_1.default.quality}p.mp4`);
                yield download_1.downloadFile(cleanUrl, filePath);
            }
        }
        else {
            console.error(`Quality ${args_1.default.quality}p not found for ${videoId}`);
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
            console.error(`Error on ${url}: ${error.message}`);
            skipped.push(url);
        }
    }
    if (skipped.length) {
        console.error("Skipped", skipped);
    }
    process.exit(0);
}))();
