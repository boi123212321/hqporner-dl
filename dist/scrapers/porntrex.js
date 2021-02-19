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
exports.PorntrexScraper = void 0;
const axios_1 = __importDefault(require("axios"));
const util_1 = require("../util");
const args_1 = __importDefault(require("../args"));
const cookieJar = {};
class PorntrexScraper {
    constructor() {
        this.url = "porntrex.com";
    }
    signin() {
        return __awaiter(this, void 0, void 0, function* () {
            const username = process.env.PORNTREX_USERNAME;
            console.error(`Signing in using ${username}`);
            const params = new URLSearchParams();
            params.append("username", username);
            params.append("pass", process.env.PORNTREX_PASSWORD);
            params.append("remember_me", "1");
            params.append("action", "login");
            params.append("email_link", "https://www.porntrex.com/email/");
            params.append("format", "json");
            params.append("mode", "async");
            const res = yield axios_1.default.post("https://www.porntrex.com/ajax-login/", params, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });
            for (const cookie of res.headers["set-cookie"]) {
                const first = cookie.split(";")[0].trim();
                const [key, value] = first.split("=");
                console.log(`Storing cookie ${key}=${value}`);
                cookieJar[key] = value;
            }
            return res;
        });
    }
    scrapeUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!cookieJar.PHPSESSID) {
                yield this.signin();
            }
            const $ = yield util_1.domFromUrl(url, {
                headers: {
                    Cookie: `PHPSESSID=${cookieJar.PHPSESSID}; kt_member=${cookieJar.kt_member}`,
                },
            });
            const downloadButtons = $(".download ul li a").toArray();
            const downloadUrls = downloadButtons
                .map((btn) => $(btn).attr("href"))
                .filter(Boolean);
            const fileUrl = downloadUrls.find((url) => url.includes(`${args_1.default.quality}p`));
            if (!fileUrl) {
                throw new Error(`Quality ${args_1.default.quality}p not found for ${url}`);
            }
            const urlSegments = url.split("/").filter(Boolean);
            urlSegments.pop();
            const id = urlSegments.pop();
            const res = yield axios_1.default.head(fileUrl);
            const size = parseInt(res.headers["content-length"]);
            return {
                id,
                name: $("title").text(),
                size,
                fileUrl,
            };
        });
    }
}
exports.PorntrexScraper = PorntrexScraper;
