const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
module.exports = {
  mode: "production", // development
  entry: {
    "./background": "./js/background.js",
    "./js/insert-community": "./js/insert-community.js",
    "./js/popup": "./js/popup.js",
  },
  devtool: "inline-source-map",
  output: {
    // "[name].[hash].bundle.js"
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          // "style-loader", //将js中的css通过style方式注入到html中
          "css-loader", // 加载处理css文件
        ],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "manifest.json" },
        { from: "img/", to: "img/", toType: "dir" },
        { from: "html", to: "html", toType: "dir" },
        { from: "css", to: "css", toType: "dir" },
      ],
    }),
  ],
  devServer: {
    static: "./dist", // 告知 dev server，从什么位置查找静态文件
    compress: true,
    port: 9000,
    host: "0.0.0.0",
    hot: true,
  },
};

// 启用devServer,不只配置, 还需要script中添加参数  serve --open
// --watch 监听 , --mode development 修改环境变量为开发环境
// --config webpack.config.js 指定配置文件路径, 可忽略(默认 webpack.config.js)
// 不要将 --watch 与 serve 一起使用没有任何意义
//"dev": "webpack serve --open --config webpack.config.js --watch --mode development"
