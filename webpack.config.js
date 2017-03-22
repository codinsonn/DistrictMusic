const path = require('path');
//const fs = require(`fs`);

const webpack = require('webpack');
const {UglifyJsPlugin} = webpack.optimize;

//const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const CopyWebpackPlugin = require(`copy-webpack-plugin`);
const ExtractTextWebpackPlugin = require(`extract-text-webpack-plugin`);
const configHtmls = require(`webpack-config-htmls`)();

const extractCSS = new ExtractTextWebpackPlugin(`css/style.css`);
/*const browserSync = new BrowserSyncPlugin(
  {
    // browse to http://localhost:3000/ during development
    host: 'localhost',
    port: 3000,
    // proxy the Webpack Dev Server endpoint
    // (which should be serving on http://localhost:3100/)
    // through BrowserSync
    proxy: 'http://localhost:3020/'
  },
  // plugin options
  {
    // prevent BrowserSync from reloading the page
    // and let Webpack Dev Server take care of this
    reload: false
  }
);/**/

// change for production build on different server path
const publicPath = `/`;

// hard copy assets folder for:
// - srcset images (not loaded through html-loader )
// - json files (through fetch)
// - fonts via WebFontLoader

/*var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  })
;*/

const copyAssets = new CopyWebpackPlugin([{
  from: `./src/assets`,
  to: `assets`
}], {
  ignore: [ `.DS_Store` ]
});

const copySongs = new CopyWebpackPlugin([{
  from: `./server/uploads/audio`,
  to: `assets/audio`
}], {
  ignore: [ `.DS_Store` ]
});

const config = {

  entry: [
    `./src/css/style.css`,
    `./src/js/script.js`
  ],

  //externals: nodeModules,

  /*externals: {
    "googleapi": "gapi"
  },/**/

  resolve: {
    // import files without extension import ... from './Test'
    extensions: [`.js`, `.jsx`, `.css`],
    "alias": {
      "wavesurfer": path.resolve(__dirname, './node_modules/wavesurfer.js/dist/wavesurfer.js'),
      "request$": "xhr"
    }
  },

  output: {
    path: path.join(__dirname, `server`, `public`),
    filename: `js/[name].[hash].js`,
    publicPath
  },

  devtool: `source-map`,

  module: {

    rules: [
      {
        test: /\.css$/,
        loader: extractCSS.extract([
          {
            loader: `css-loader`,
            options: {
              importLoaders: 1
            }
          },
          {
            loader: `postcss-loader`
          }
        ])
      },
      {
        test: /\.html$/,
        loader: `html-loader`,
        options: {
          attrs: [
            `audio:src`,
            `img:src`,
            `video:src`,
            `source:srcset`
          ] // read src from video, img & audio tag
        }
      },
      {
        test: /\.(jsx?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: `babel-loader`
          },
          {
            loader: `eslint-loader`,
            options: {
              fix: true
            }
          }
        ]
      },
      {
        test: /\.(svg|png|jpe?g|gif|webp)$/,
        loader: `url-loader`,
        options: {
          limit: 1000, // inline if < 1 kb
          context: `./src`,
          name: `[path][name].[ext]`
        }
      },
      {
        test: /\.(mp3|mp4)$/,
        loader: `file-loader`,
        options: {
          context: `./src`,
          name: `[path][name].[ext]`
        }
      },
      {
        test: require.resolve("wavesurfer.js"),
        loader: "expose?WaveSurfer"
      }
    ]

  },

  plugins: [
    extractCSS,
    copyAssets
    //browserSync,
    //copySongs
  ]

};

//config.externals.googleapi = "gapi";

if (process.env.NODE_ENV === `production`) {

  //image optimizing
  config.module.rules.push({
    test: /\.(svg|png|jpe?g|gif)$/,
    loader: `image-webpack-loader`,
    enforce: `pre`
  });

  config.plugins = [
    ...config.plugins,
    new UglifyJsPlugin({
      sourceMap: true, // false returns errors.. -p + plugin conflict
      comments: false
    })
  ];

}

config.plugins = [...config.plugins, ...configHtmls.plugins];

module.exports = config;
