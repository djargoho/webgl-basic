"use strict";
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    main: ["./index.js"]
  },
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, "./src"),
        loaders: "babel-loader"
      },
      {
        test: /\.css$/,
        // include: path.resolve(__dirname, "./src"),
        loaders: "style-loader!css-loader"
      },
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        context: "./public",
        from: "*.*"
      }
    ])
  ],
  devServer: {
    contentBase: "./public",
    host: "localhost",
    port: 3005
  }
};