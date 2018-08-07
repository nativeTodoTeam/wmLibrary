// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueResource from 'vue-resource'
import App from './App.vue'
import router from './router'

// Vue.config.productionTip = false
Vue.use(VueResource)
/* eslint-disable no-new */
// new Vue({
//   el: '#app',
//   router,
//   template: '<App/>',
//   components: { App }
// })
// 引用样式
import './assets/sass/app.scss'

let vm = new Vue({
  el: '#app',
  router: router,
  render: h => h(App)
})

Vue.use({
  vm
})
