# 记录一些学习koa时候的东西

## koa是基于洋葱圈模型的

### app.use 可以链式调用
```js
app.use(fn1)
  .use(fn2)
  .use(fn3)
  .listen(3000)
```

### koa-compose可以整合多个中间件：
```js
const middlewares = require('koa-compose')([middleware1, middleware2])
app.use(middlewares)
```

### koa-body模块可以用来从 POST 请求的数据体里面提取键值对
```js
const koaBody = require('koa-body')

const main = async function(ctx) {
  const body = ctx.request.body
  if (!body.name) ctx.throw(400, '.name required')
  ctx.body = { name: body.name }
}

app.use(koaBody())
```

### 错误处理
运行过程中一旦出错，Koa 会触发一个error事件。监听这个事件，也可以处理错误。

需要注意的是，如果错误被try...catch捕获，就不会触发error事件。

这时，必须调用ctx.app.emit()，手动释放error事件，才能让监听函数生效。

```js
...
try {

} catch(err) {
  ...
  ctx.app.emit('error', arg1, arg2)
}

app.on('error', (arg1, arg2) => {}) // 监听错误
```
