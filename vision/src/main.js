import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import router from './router'
import store from './store'
import axios from 'axios'


import SocketService from './utils/socket_service'

// 对服务端进行websocket连接
SocketService.Instance.connect()

// 挂载SocketServe对象到Vue原型对象上
Vue.prototype.$socket = SocketService.Instance

// 引入全局的样式文件
import './assets/css/global.css'

// 引入字体样式
import './assets/font/iconfont.css'


// 请求基准的路径设置  设置的是服务器端的地址不是客户端的地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'


Vue.prototype.$http = axios

// console.log(axios)
// console.log('-------------------------')
// console.log(Vue.prototype.$http)

Vue.use(VueRouter)
Vue.prototype.$echarts = window.echarts

Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app')