const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './js/script.js',
  output: {
    filename: 'js/main.js',
    clean: true,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'index.html' },
        { from: 'assets', to: 'assets' },
        { from: 'css', to: 'css' },
      ],
    }),
  ],
};
