import yargs = require("yargs");

export default yargs
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
