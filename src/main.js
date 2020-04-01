import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import fabric from 'fabric'
Vue.use(fabric);

new Vue({
  render: h => h(App),
}).$mount('#app')
