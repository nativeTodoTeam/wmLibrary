const Koa = require('koa');
const app = new Koa();
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const staticFile = require('koa-static');
const views = require('koa-views');
const logUtil = require('./utils/log_util');
const cors = require('koa-cors');  // 设置跨域问题


const index = require('./routes/index');
const register = require('./routes/api/register');
const books = require('./routes/api/book');
<<<<<<< HEAD
const login = require('./routes/api/login');
const borrowBook = require('./routes/api/borrowBook');
=======
const user = require('./routes/api/user');
>>>>>>> e2087d77d1e90baf555e4abd4df3184378138c58

// error handler
onerror(app);

// 解决跨域报错问题
app.use(cors());

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

// routes
// allowedMethods 用于校验请求的方法, 如果用 post 请求访问 get 接口，就会直接返回失败
app.use(index.routes(), index.allowedMethods())
app.use(register.routes(), register.allowedMethods());
app.use(books.routes());
<<<<<<< HEAD
app.use(login.routes(), register.allowedMethods());
app.use(borrowBook.routes(), register.allowedMethods());

// console.log
app.use(async (ctx, next) => {
  console.log(ctx.response);
  await next();
});
=======
app.use(user.routes());
>>>>>>> e2087d77d1e90baf555e4abd4df3184378138c58

// error-handling
app.on('error', (err, ctx) => {
  console.error('*********************************errorStart*************************************');
  console.error('server error:');
  console.error(err);
  console.error(ctx);
  console.error('***********************************errorEnd*************************************');
});

module.exports = app
