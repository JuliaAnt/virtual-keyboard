const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './js/script.js',
  output: {
    filename: 'js/main.js',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: 'index.html' }],
      patterns: [{ from: 'assets', to: 'assets' }],
      patterns: [{ from: 'css', to: 'css' }],
    }),
  ],
};
