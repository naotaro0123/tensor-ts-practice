const path = require('path');
const WorkerLoader = require('worker-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    path: `${__dirname}/dist`,
    filename: 'main.js'
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts$/,
        use: 'ts-loader'
      },
      {
        test: /\.(frag|vert|glsl)$/,
        use: [
          {
            loader: 'webpack-glsl-loader',
            options: {}
          }
        ]
      }
    ]
  },
  plugins: [new WorkerLoader()],
  resolve: {
    extensions: ['.ts', '.js']
  },
  devServer: {
    contentBase: path.resolve(__dirname, './src'),
    watchContentBase: true,
    port: 4000,
    open: true,
    openPage: './index.html'
  }
};
