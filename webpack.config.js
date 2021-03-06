/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  devServer: {
    disableHostCheck: true,
    host: "0.0.0.0",
    port: process.env.PORT || 8080,
  },
  devtool: "inline-source-map",
  entry: "./src/index",
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.(ts|js)x?$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", { targets: { esmodules: true } }],
              "@babel/preset-react",
            ],
          },
        },
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
