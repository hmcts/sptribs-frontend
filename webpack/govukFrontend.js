const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const packageJson = path.resolve(__dirname, '../node_modules/govuk-frontend/package.json');
const root = path.resolve(packageJson, '..', 'dist', 'govuk');
const sass = path.resolve(root, 'all.scss');
const javascript = path.resolve(root, 'all.js');
const components = path.resolve(root, 'components');
const assets = path.resolve(root, 'assets');
const fonts = path.resolve(assets, 'fonts');
const images = path.resolve(assets, 'images');
const rebrand = path.resolve(assets, 'rebrand');

const copyGovukTemplateAssets = new CopyWebpackPlugin({
  patterns: [
    { from: fonts, to: 'assets/fonts' },
    { from: images, to: 'assets/images' },
    { from: rebrand, to: 'assets/rebrand' },
    { from: `${assets}/manifest.json`, to: 'assets/manifest.json' }
  ],
});

module.exports = {
  paths: { template: root, components, sass, javascript, assets },
  plugins: [copyGovukTemplateAssets],
};
