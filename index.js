// koa是基于洋葱圈模型的

const fs = require('fs')
const Koa = require('koa')
const router = require('koa-route')
const logger = require('consola')
const compose = require('koa-compose')
const koaBody = require('koa-body')

const app = new Koa()
const PROT = 3000

const handleError = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    const code = err.statusCode || err.status || 404
    const errBody = { code, message: err.message }
    ctx.response.status = code
    ctx.response.body = errBody
    // 需要注意的是，如果错误被try...catch捕获，就不会触发error事件
    // 这时，必须调用ctx.app.emit()，手动释放error事件，才能让监听函数生效
    ctx.app.emit('error', errBody, ctx)
    logger.error(`${code}: ${err.message}`)
  }
}

const handleMain = (ctx, next) => {
  const n = ~~(ctx.cookies.get('count') || 0) + 1
  ctx.cookies.set('count', n)
  logger.success(`我是handleMain，这是我第 ${n} 次被访问`)
  next() // 这里不next()就不会向下面的中间件走了
}

const homeAction = (ctx, next) => {
  ctx.response.type = 'html'
  ctx.response.body = fs.createReadStream('./html/index.html')
  logger.success('我是homeAction, 我被访问了')
  next()
  console.log('three')
}

const homeAction1 = (ctx, next) => {
  console.log('one')
  next()
  console.log('two')
}

const pageGetAction = ctx => {
  ctx.response.type = 'html'
  ctx.response.body = fs.createReadStream('./html/page.html')
  logger.success('你好，我是pageGetAction, 我被访问了')
}

const pagePostAction = (ctx) => {

}

const errorAction = (ctx, code) => {
  ctx.throw(~~code)
}

app.on('error', (errBody, ctx) => {
  logger.error(`app.on('error'): ${errBody.code}: ${errBody.message}`)
})

app.use(koaBody())
  .use(compose([handleMain, handleError])) // koa-compose用来合成多个中间件
  .use(router.get('/', compose([homeAction, homeAction1]))) // 如果使用了koa-route，也可以这样在路由里合成多个中间件
  .use(router.get('/page', pageGetAction))
  .use(router.post('/page', pagePostAction))
  .use(router.get('/error/:code', errorAction))
  .listen(PROT)

logger.success(`监听端口：${PROT}`)
