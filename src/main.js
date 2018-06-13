// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Meta from 'vue-meta'
import ElementUI from './lib/ElementUI'
import ECharts from './lib/ECharts'
import provide from './graphql/apollo'
import App from './App'
import router from './router'

Vue.use(Meta)
Vue.use(ElementUI)
Vue.component('chart', ECharts)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  provide,
  components: { App },
  render: h => h(App),
  mounted() {
    // You'll need this for renderAfterDocumentEvent.
    document.dispatchEvent(new Event('render-event'))
  }
})
