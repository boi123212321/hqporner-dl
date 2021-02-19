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
exports.HQPornerScraper = void 0;
const util_1 = require("../util");
const args_1 = __importDefault(require("../args"));
const axios_1 = __importDefault(require("axios"));
class HQPornerScraper {
    constructor() {
        this.url = "hqporner.com";
    }
    scrapeUrl(url) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const $ = yield util_1.domFromUrl(url);
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
            const $iframe = yield util_1.domFromUrl(`https:${iframeUrl}`);
            const qualityRegex = new RegExp(`href=['"][a-zA-Z\/0-9.]+${args_1.default.quality}\.mp4['"]`);
            const matches = $iframe.xml().match(qualityRegex);
            if (matches && matches.length) {
                const matchedStr = matches[0];
                const cleanUrl = `https:${matchedStr.slice(6, -1)}`;
                const res = yield axios_1.default.head(cleanUrl);
                const size = parseInt(res.headers["content-length"]);
                return {
                    id: videoId,
                    name: videoName,
                    fileUrl: cleanUrl,
                    size,
                };
            }
            else {
                throw new Error(`Quality ${args_1.default.quality}p not found for ${url}`);
            }
        });
    }
}
exports.HQPornerScraper = HQPornerScraper;
