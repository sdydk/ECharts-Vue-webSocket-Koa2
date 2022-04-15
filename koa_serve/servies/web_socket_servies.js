const path = require('path')

const fileUtils = require('../utils/file_utils')

// 使用WEBSOCKET到达数据的实时监听
const WebSocket = require('ws')

// 创建WebStocket服务端的对象, 端口号是9999
const wss = new WebSocket.Server({
    port: 9999
})

// 服务端开启了监听
module.exports.listen = () => {
    // 对客户端的连接事件进行监听,client代表的是客户端的连接SOCKET对象
    wss.on('connection', (client) => {
        console.log('有客户连接成功了!!!')

        // 对客户端的连接对象进行message事件的监听,msg由客户端发送给服务端的数据
        client.on('message', async msg => {
            console.log('客户端发送数据给服务端了' + msg)
            let payload = JSON.parse(msg)
            const action = payload.action
            if (action === 'getData') {
                let filePath = '../data/' + payload.chartName + '.json'

                // payload.charName----tren/seller/map/rank/hot/stock
                filePath = path.join(__dirname, filePath)

                const ret = await fileUtils.getFileJsonData(filePath) //文件的内容

                payload.data = ret //在服务端获取到数据的基础之上,增加一个data字段,该字段对应的就是某个json文件的内容


                // 服务器往客户端发送数据
                client.send(JSON.stringify(payload))
            } else { //原封不动的将所接收到的数据转发给每一个处在连接状态的客户端
                // wss.clients----所有连接的客户端

                wss.clients.forEach((client) => {
                    client.send(msg)
                })

            }

        })
    })
}