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
console.log(`Base folder: ${path_1.resolve(baseFolder)}`);
if (!fs_1.existsSync(baseFolder)) {
    fs_1.mkdirSync(baseFolder, { recursive: true });
}
function domFromUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Getting " + url);
        const { data } = yield axios_1.default.get(url);
        return cheerio_1.default.load(data);
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    for (const url of urls) {
        const $ = yield domFromUrl(url);
        const iframeUrl = (_a = $("iframe").toArray()[0]) === null || _a === void 0 ? void 0 : _a.attribs.src;
        if (!iframeUrl) {
            console.error("Iframe URL not found");
            process.exit(1);
        }
        const videoName = $("h1.main-h1").text();
        console.log(`Found video: ${videoName}`);
        const splits = iframeUrl.split("/").filter(Boolean);
        const videoId = splits[splits.length - 1];
        console.log(`ID: ${videoId}`);
        const $iframe = yield domFromUrl(`https:${iframeUrl}`);
        const qualityRegex = new RegExp(`href=['"][a-zA-Z\/0-9.]+${args_1.default.quality}\.mp4['"]`);
        const matches = $iframe.xml().match(qualityRegex);
        if (matches && matches.length) {
            const matchedStr = matches[0];
            const cleanUrl = `https:${matchedStr.slice(6, -1)}`;
            const filePath = path_1.resolve(baseFolder, `${videoName}-${args_1.default.quality}p.mp4`);
            yield download_1.downloadFile(cleanUrl, filePath);
        }
        else {
            console.error(`Quality ${args_1.default.quality}p not found for ${videoId}`);
        }
    }
    process.exit(0);
}))();
