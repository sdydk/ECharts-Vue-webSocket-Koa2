// 处理业务逻辑的中间件，读取某个JSON文件的数据

const path = require('path')
const fileUtils = require('../utils/file_utils')
module.exports = async(ctx, next) => {

    // 根据url
    const url = ctx.request.url

    let filePath = url.replace('/api', '')

    filePath = '../data' + filePath + '.json'

    // 获取JSON的绝对路径
    filePath = path.join(__dirname, filePath)

    try {
        const ret = await fileUtils.getFileJsonData(filePath)
        console.log(ret)

        // 设置相应体
        ctx.response.body = ret

    } catch (error) {
        const errorMsg = {
            message: '读取文件内容失败,文件资源不存在!',
            status: 404
        }
        ctx.response.body = JSON.stringify(errorMsg)

    }




    next()
}