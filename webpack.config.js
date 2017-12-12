
module.exports = {
  entry: './demo/_js/app.js',
  output: {
    filename: 'app.bundle.js',
    path: __dirname+'/demo/assets'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ["env", {
              "targets": {
                "browsers": ["> 0.5%", "last 5 versions"]
              },
              "debug": false
            }]
          ]
        }
      }
    }]
  },
  plugins: []
};