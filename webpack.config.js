const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
module.exports = {
  mode: "production", // development
  entry: {
    "./background": "./js/background.js",
    "./js/insert-community": "./js/insert-community.js",
    "./js/popup": "./js/popup.js"
  },
  devtool: "inline-source-map",
  output: {
    // "[name].[hash].bundle.js"
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          // "style-loader", //将js中的css通过style方式注入到html中
          "css-loader" // 加载处理css文件
        ]
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "manifest.json" },
        { from: "img/", to: "img/", toType: "dir" },
        { from: "html", to: "html", toType: "dir" },
        { from: "css", to: "css", toType: "dir" },
        { from: "node_modules/chrome-extension-file-icons-js/css/style.css", to: "css/file-icon.css" },
        { from: "node_modules/chrome-extension-file-icons-js/fonts/", to: "fonts/", toType: "dir" }
      ]
    })
  ],
  devServer: {
    static: "./dist", // 告知 dev server，从什么位置查找静态文件
    compress: true,
    port: 9000,
    host: "0.0.0.0",
    hot: true
  }
};
