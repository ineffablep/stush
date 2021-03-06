import webpack from "webpack";
import path from "path";
import MinifyPlugin from "babel-minify-webpack-plugin";
import CleanWebpackPlugin from "clean-webpack-plugin";


// Track current mode of execution development/production
const __development = process.env.NODE_ENV === "development";

const libraryName = "stush";
const outputFile = `${libraryName}.js`;

export default {
  target: "node",
  entry: [
    `${__dirname}/src/index.js`
  ],
  devtool: __development ? "source-map": "",
  output: {
    path: `${__dirname}/lib`,
    filename: outputFile,
    library: libraryName,
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /(node_modules|bower_components)/
      }
    ]
  },
  resolve: {
    modules: [
      "node_modules",
      path.resolve("./src")
    ],
  },
  externals: {
    lodash: {
      commonjs: "lodash",
      commonjs2: "lodash",
      amd: "lodash",
      root: "_"
    },
    "better-queue": "better-queue",
    "joi": "joi",
    "stripe": "stripe",
    "memory-cache": "memory-cache"
  },
  plugins: [
    new CleanWebpackPlugin(["lib"]),
    ...(__development ? []: [
      new MinifyPlugin()
    ]),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production")
    })
  ]
};
