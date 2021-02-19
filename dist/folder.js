"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseFolder = void 0;
const args_1 = __importDefault(require("./args"));
const path_1 = require("path");
const fs_1 = require("fs");
const dotenv_1 = __importDefault(require("dotenv"));
if (fs_1.existsSync(".env")) {
    console.error("Loading .env");
    dotenv_1.default.config();
}
exports.baseFolder = args_1.default.folder;
console.error(`Base folder: ${path_1.resolve(exports.baseFolder)}`);
if (!fs_1.existsSync(exports.baseFolder)) {
    fs_1.mkdirSync(exports.baseFolder, { recursive: true });
}
