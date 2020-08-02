const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './mixjs/index.js',
  output: {
    filename: 'bundle.js',
    path : path.resolve(__dirname, 'dist')
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    hot: true,
    inline: true,
    port: 3000
  },
  devtool: 'inline-source-map',

};