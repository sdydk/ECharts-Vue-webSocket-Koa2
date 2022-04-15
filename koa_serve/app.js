// 服务器的入口文件
// 1.绑定KOA实例对象
const Koa = require('koa')
const app = new Koa()

// 2.绑定中间件

// 第一层中间件
const respDurationMiddleware = require('./middlware/koa_response_duration.js')
app.use(respDurationMiddleware)

// 第二层中间件
const respHeaderMiddleware = require('./middlware/koa_response_header.js')
app.use(respHeaderMiddleware)

// 第三层中间件
const respDataMiddleware = require('./middlware/koa_response_data.js')
app.use(respDataMiddleware)

// 3.绑定端口号
app.listen(8888, () => {
    console.log('app serve running at http://127.0.0.1:8888')
})





const WebSocketService = require('./servies/web_socket_servies')

// 开启服务端的监听,监听客户端的连接;当某个客户端连接成功之后,就会对这个客户端进行message事件的监听
WebSocketService.listen()