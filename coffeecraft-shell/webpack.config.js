const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-ts");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (webpackConfigEnv, argv) => {
  const orgName = "coffeecraft";
  const defaultConfig = singleSpaDefaults({
    orgName,
    projectName: "root-config",
    webpackConfigEnv,
    argv,
    disableHtmlGeneration: true,
  });

  return merge(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
    output: {
      libraryTarget: 'system',
      library: {
        type: 'system',
      },
    },
    experiments: {
      outputModule: false,
    },
    externals: ['single-spa'],
    plugins: [
      new HtmlWebpackPlugin({
        inject: false,
        template: "src/index.ejs",
        templateParameters: {
          isLocal: webpackConfigEnv && webpackConfigEnv.isLocal,
          orgName,
        },
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "src/auth.js",
            to: "auth.js"
          }
        ]
      }),
      new ModuleFederationPlugin({
        name: "coffeecraft-shell",
        remotes: {
          "catalogoModule": "catalogoModule@https://transcendent-granita-7f7eb4.netlify.app/react/remoteEntry.js",
          "angularModule": "angularModule@https://transcendent-granita-7f7eb4.netlify.app/angular/remoteEntry.js",
          "vueModule": "vueModule@https://transcendent-granita-7f7eb4.netlify.app/vue/remoteEntry.js"
        },
        shared: {
          "single-spa": {
            singleton: true,
            requiredVersion: false
          }
        }
      })
    ],
  });
};
