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
exports.downloadFile = void 0;
const fs_1 = require("fs");
const axios_1 = __importDefault(require("axios"));
const cli_progress_1 = require("cli-progress");
const chalk_1 = require("chalk");
function downloadSpeed(bytes, secs) {
    return bytes / secs;
}
function downloadFile(url, file) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fs_1.existsSync(file)) {
            console.warn(`\t${url} already exists, skipping...`);
            return;
        }
        console.error(`\tDownloading ${url} to ${file}...`);
        const downloadBar = new cli_progress_1.SingleBar({
            format: `Fetching |${chalk_1.cyan("{bar}")}| {percentage}% | {loaded}/{totalSize} MB | Speed: {speed}kB/s`,
        }, cli_progress_1.Presets.shades_classic);
        downloadBar.start(100, 0, {
            percentage: "0",
            loaded: 0,
            totalSize: 0,
            speed: "N/A",
        });
        const response = yield axios_1.default({
            url: url,
            method: "GET",
            responseType: "stream",
        });
        const start = +new Date();
        const writer = fs_1.createWriteStream(file);
        const totalSize = parseInt(response.headers["content-length"]);
        let loaded = 0;
        response.data.on("data", (data) => {
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
        yield new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", (err) => {
                downloadBar.stop();
                reject();
            });
        });
        downloadBar.stop();
    });
}
exports.downloadFile = downloadFile;
