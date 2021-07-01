const path = require('path');
const fs = require('fs');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const { config } = require('process');

const imageDirectoryContents = fs.readdirSync('./src/Images/');
const mappedImageDirectoryContents = imageDirectoryContents.map(e => `'/src/Images/${e}'`);
const imagePathList = mappedImageDirectoryContents.join();
const imageListScript = `const _imageList = [${imagePathList}];`;

const bitmapFontDirectoryContents = fs.readdirSync('./src/BitmapFonts/');
const mappedBitmapFontDirectoryContents = bitmapFontDirectoryContents.map(e => `'/src/BitmapFonts/${e}'`);
const bitmapFontPathList = mappedBitmapFontDirectoryContents.join();
const bitmapFontListScript = `const _bitmapFontList = [${bitmapFontPathList}];`;

const templateBase = fs.readFileSync('./template.html');
const templateContent = templateBase.toString().replace('%IMAGES%', imageListScript).replace('%BITMAP_FONTS%', bitmapFontListScript);

module.exports = {
  entry: './src/main.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    //publicPath: './'
  },
  // Keeps your typescript code intact (won't minify)
  mode: "development",
  target: "web",
  // Compiles the typesript files based on `tsconfig.json`
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: [
          path.resolve(__dirname, 'src'),
        ],
        use: 'ts-loader'
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  // Generates the `main.js.map` file for translating js
  // exceptions back to the typescript files
  devtool: "source-map",
  // Generates your `index.html` file. Why do you want this? Not quite sure,
  // but without it the dev-server auto-reloading doesn't work
  plugins: [new HtmlWebpackPlugin({
    filename: 'index.html',
    templateContent
  })],
  // Hide some annoying warnings when compiling
  performance: {
      hints: false
  },
  // Hosts an http server that detects file changes in the project
  // and automatically reloads the connected web page
  devServer: {
    host: 'localhost',
    disableHostCheck: true,
    port: 8080
  },
};
