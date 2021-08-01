import Vue from 'vue'
import App from './App.vue'
// import router from '@/router'
import lang from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'
import "./assets/scss/index.scss"
import { Loading, Row, Col } from 'element-ui';
Vue.use(Loading.directive);
Vue.use(Row);
Vue.use(Col);
Vue.prototype.$loading = Loading.service;
locale.use(lang)
Vue.config.productionTip = false

new Vue({
  // router,
  render: h => h(App)
}).$mount('#app')
