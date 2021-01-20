const path = require("path");

module.exports = {
  entry: "./lib/main.js",
  mode: "development",
  devtool: "hidden-source-map",
  output: {
    path: path.resolve(__dirname, "lib/"),
    filename: "bundle.js",
  },
};
