// 设置响应头中间件
module.exports = async(ctx, next) => {
    // 设置响应头
    const contentType = 'application/json; charset=utf-8'
    ctx.set('Content-Type', contentType)


    // 设置这两个响应头可以解决AJAX跨域的问题
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.set('Access-Control-Allow-Header', 'X-Requested-With')
    ctx.set('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE')

    await next()
}