"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
exports.default = yargs
    .option({
    folder: {
        type: "string",
        default: "./videos",
    },
    quality: {
        type: "string",
        alias: "q",
        default: "1080",
    },
    dry: {
        type: "boolean",
        default: false,
    },
})
    .check((argv) => {
    if (!["360", "720", "1080", "2160"].includes(argv.quality)) {
        throw new Error("Invalid quality");
    }
    if (!argv._.length) {
        throw new Error("No URLs defined");
    }
    return true;
}).argv;
