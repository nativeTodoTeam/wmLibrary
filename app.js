const Koa = require('koa');
const app = new Koa();
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const jsonwebtoken = require('jsonwebtoken');
const jwt = require('koa-jwt');
const logger = require('koa-logger');
const staticFile = require('koa-static');
const views = require('koa-views');
const logUtil = require('./utils/log_util');
const cors = require('koa-cors');  // 设置跨域问题
const path = require('path')


const index = require('./routes/index');
const register = require('./routes/api/register');
const books = require('./routes/api/book');
const review = require('./routes/api/review');
const comment = require('./routes/api/comment');
const login = require('./routes/api/login');
const borrowBook = require('./routes/api/borrowBook');
const user = require('./routes/api/user');
const {resTokenErr} = require('./public/js/route');

// error handler
onerror(app);

// 解决跨域报错问题
app.use(cors());

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}));

//Custom 401 handling if you don't want to expose koa-jwt errors to users
app.use((ctx, next) => {
  return next().catch((err) => {
    if (401 == err.status) {
      resTokenErr(ctx, 'token失效');
    } else {
      throw err;
    }
  });
});

/* jwt密钥 */
const secret = 'shared-secret';

app.use(
  jwt({ secret: secret }).unless({ path: [/^\/public/, /^\/register/, /^\/login/, /^\/index/] })
);

app.use(async (ctx, next) => {
  try {
    if (ctx.url.match(/^\/login/) || ctx.url.match(/^\/register/) || ctx.url.match(/^\/public/) || ctx.url.match(/^\/index/)) {
      await next();
    } else {

      const token = ctx.header.authorization;  // 获取jwt

      if (token) {
        let payload = await jsonwebtoken.verify(token.split(' ')[1], secret);
        // 解密，获取payload存入ctx
        if (payload && payload.data && payload.data.id) {
          ctx.user = {
            id: payload.data.id
          };
          await next();
        } else {
          resTokenErr(ctx, 'token失效');
        }
      } else {
        resTokenErr(ctx, 'token失效');
      }
    }
  } catch(err) {
    resTokenErr(ctx, 'token失效');
  }
});

app.use(json());

// 打印日志
app.use(logger());

// 将 views 目录设定为模版目录
app.use(views(__dirname + '/views'));

// 将 public 目录设置为静态资源目录
app.use(staticFile(__dirname + '/public'));
app.use(staticFile(path.join(__dirname, '..', 'dist')))

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
app.use(register.routes(), register.allowedMethods());
app.use(index.routes(), register.allowedMethods());
app.use(books.routes());
app.use(review.routes());
app.use(comment.routes());
app.use(login.routes(), register.allowedMethods());
app.use(borrowBook.routes(), register.allowedMethods());
app.use(user.routes());

// error-handling
app.on('error', (err, ctx) => {
  console.error('*********************************errorStart*************************************');
  console.error('server error:');
  console.error(err);
  console.error(ctx);
  console.error('***********************************errorEnd*************************************');
});

module.exports = app
