const Koa = require('koa');
const app = new Koa();
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const staticFile = require('koa-static');
const views = require('koa-views');
const logUtil = require('./utils/log_util');

const index = require('./routes/index');
const register = require('./routes/register');

const cors = require('koa-cors');

// error handler
onerror(app);

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}));
app.use(json());

// 打印日志
app.use(logger());

// 将 views 目录设定为模版目录
app.use(views(__dirname + '/views'));

// 将 public 目录设置为静态资源目录
app.use(staticFile(__dirname + '/public'));

// log4js
app.use(async (ctx, next) => {
  //响应开始时间
  const start = new Date();
  //响应间隔时间
  let ms;
  try {
    //开始进入到下一个中间件
    await next();

    ms = new Date() - start;
    //记录响应日志
    logUtil.logResponse(ctx, ms);

  } catch (error) {
    ms = new Date() - start;
    //记录异常日志
    logUtil.logError(ctx, error, ms);
  }
});

app.use(cors());
// routes
// allowedMethods 用于校验请求的方法, 如果用 post 请求访问 get 接口，就会直接返回失败
app.use(index.routes(), index.allowedMethods())
app.use(register.routes(), register.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  console.error('*********************************errorStart*************************************');
  console.error('server error:');
  console.error(err);
  console.error(ctx);
  console.error('***********************************errorEnd*************************************');
});

module.exports = app
