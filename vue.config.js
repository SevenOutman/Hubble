const path = require('path')
const PrerenderSPAPlugin = require('prerender-spa-plugin')
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer

module.exports = {
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      return {
        plugins: [
          new PrerenderSPAPlugin({
            staticDir: path.join(__dirname, 'dist'),
            routes: ['/react-vs-vue'],

            renderer: new Renderer({
              inject: {
                headless: true,
              },
              // @see https://github.com/chrisvfritz/prerender-spa-plugin/issues/200#issuecomment-391204354
              // REMOVED headless: false,

              // @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-fails-due-to-sandbox-issues
              args: ['--no-sandbox', '--disable-setuid-sandbox'],
              renderAfterDocumentEvent: 'render-event',
            }),
          }),
        ],
      }
    }
  },
}
