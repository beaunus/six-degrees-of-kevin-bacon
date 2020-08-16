/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  devtool: "inline-source-map",
  entry: "./src/index",
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.(ts|js)x?$/,
        use: { loader: "babel-loader" },
      },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
    ],
  },
  output: { filename: "bundle.js", path: path.join(__dirname, "/dist") },
  plugins: [
    new Dotenv(),
    new HtmlWebpackPlugin({
      favicon: "./public/assets/icon/favicon.ico",
      template: "./public/index.html",
    }),
  ],
  resolve: { extensions: [".ts", ".tsx", ".js"] },
};
