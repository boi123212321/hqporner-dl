import argv from "./args";
import { resolve } from "path";
import { existsSync, mkdirSync } from "fs";
import dotenv from "dotenv";

if (existsSync(".env")) {
  console.error("Loading .env");
  dotenv.config();
}

export const baseFolder = argv.folder;
console.error(`Base folder: ${resolve(baseFolder)}`);

if (!existsSync(baseFolder)) {
  mkdirSync(baseFolder, { recursive: true });
}
