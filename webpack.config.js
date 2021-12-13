const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
module.exports = {
  mode: "production", // development
  entry: {
    background: "./js/background.js",
    "insert-community": "./js/insert-community.js",
    popup: "./js/popup.js",
  },
  devtool: "source-map",
  output: {
    // "[name].[hash].bundle.js"
    filename: "js/gitee-helper-[name].js", //打包后js的名称 此选项决定了每个输出 bundle 的名称。这些 bundle 将写入到 output.path 选项指定的目录下。
    path: path.resolve(__dirname, "dist"), //打包输出到当前路径的build文件夹中
    publicPath: "/", // 服务器下资源引用的根目录
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
