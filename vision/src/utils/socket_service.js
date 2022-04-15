export default class SocketService {
    static instance = null
    static get Instance() {
        if (!this.instance) {
            this.instance = new SocketService()
        }
        return this.instance
    }
    ws = null

    // 存储回调函数
    callBackMapping = {}

    // 标识是否连接成功
    connected = false

    // 记录重试的次数
    sendRetryCount = 0

    // 重新尝试连接的次数
    connectRetryCount = 0
        // 定义连接服务器的方法
    connect() {

        if (!window.WebSocket) {
            return console.log('您的浏览器不支持WebSocket')
        }
        this.ws = new WebSocket('ws://localhost:9999')

        // 连接成功的事件
        this.ws.onopen = () => {
            console.log('连接服务器成功了!!!')
            this.connected = true
            this.connectRetryCount = 0
        }

        // 连接服务器失败;当连接成功之后,服务器关闭的情况
        this.ws.onclose = () => {
            console.log('连接服务器端失败了!!!')
            this.connected = false
            this.connectRetryCount++
                setTimeout(() => {
                    this.connect()
                }, this.connectRetryCount * 500)
        }
        this.ws.onmessage = (msg) => {
            console.log('接收到从服务器发送的数据!!!')

            if (typeof msg.data == 'object') {
                console.log(msg.data)
            }
            // const recvData0 = typeof msg.data == 'string' ? JSON.parse(msg.data) : msg.data

            // console.log(typeof recvData0)

            const recvData = JSON.parse(msg.data)
            const socketType = recvData.socketType

            // 判断回调函数是否存在
            if (this.callBackMapping[socketType]) {
                const action = recvData.action

                if (action === 'getData') {
                    const realData = JSON.parse(recvData.data)
                    this.callBackMapping[socketType].call(this, realData)

                } else if (action === 'fullScreen') {
                    this.callBackMapping[socketType].call(this, recvData)

                } else if (action === 'themeChange') {}
            }

        }
    }


    // 以下三个方法是组件所调用的
    // 回调函数的注册
    registerCallBack(socketType, callBack) {
        this.callBackMapping[socketType] = callBack
    }

    // 取消某一个回调函数
    unRegisterCallBack(socketType) {
        this.callBackMapping[socketType] = null
    }


    // 发送数据的方法 
    send(data) {
        if (this.connected) {
            this.sendRetryCount = 0
            this.ws.send(JSON.stringify(data))
        } else {
            this.sendRetryCount++
                setTimeout(() => {
                    this.send(data)
                }, this.sendRetryCount * 500)

        }

    }
}