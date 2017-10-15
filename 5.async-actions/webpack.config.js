let Path = require("path")

let folder = JSON.parse(process.env.npm_config_argv).original[1]

module.exports = {
  devtool: "eval",

  entry: {
    app: `./${folder}/index.js`,
    vendors: `./${folder}/vendors.js`,
  },
  output: {
    pathinfo: true,
    filename: 'js/[name].js',
    path: Path.resolve("public"),
    publicPath: "/",
  }
}