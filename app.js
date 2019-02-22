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
const logUtil = require('./config/log_config');
const cors = require('koa-cors');  // 设置跨域问题
const path = require('path')
const {resTokenErr} = require('./public/js/route');
const session = require('koa-session');

// 路由
const index = require('./routes/page/index');

// 接口
const register = require('./routes/api/user/register');
const books = require('./routes/api/admin/book');
const review = require('./routes/api/user/review');
const comment = require('./routes/api/user/comment');
const login = require('./routes/api/user/login');
const borrowBook = require('./routes/api/borrowBook');
const user = require('./routes/api/user/user');
const setCompany = require('./routes/api/admin/setCompany');
const bookType = require('./routes/api/admin/bookType');
const personnel = require('./routes/api/admin/personnelManage');
const adminLogin = require('./routes/api/admin/login');
const upload = require('./routes/api/upload');

// error handler
onerror(app);

// 解决跨域报错问题
app.use(cors());

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}));

app.keys = ['some secret hurr'];

const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};
//初始化SESSION
app.use(session(CONFIG, app));

// 记录不需要验证的路径
const noVerify = [/^\/public/, /^\/css/, /^\/js/, /^\/img/, /^\/dist/, /^\/api\/register/, /^\/api\/user\/login/, /^\/api\/admin\/login/, /^\/addbook/, /^\/apidoc/];
const noVerifySession = [...noVerify, /^\/api/]; // 访问接口不需要验证session
const noVerifyToken = [...noVerify, /^\/page/]; // 访问后台页面不需要验证token

app.use(async (ctx, next) => {

  let isPass = false;
  for(let i = 0; i < noVerifySession.length; i++) {
    if (ctx.url.match(noVerifySession[i])) {
      isPass = true;
      break;
    }
  }

  if (isPass) {
    await next();
  } else {
    console.log('没有后台, 暂时不处理了');
    await next();
  }
});

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

//jwt token验证
app.use(
  jwt({ secret: secret }).unless({ path: noVerifyToken })
);

app.use(async (ctx, next) => {
  try {

    let isPass = false;
    for(let i = 0; i < noVerifyToken.length; i++) {
      if (ctx.url.match(noVerifyToken[i])) {
        isPass = true;
        break;
      }
    }

    if (isPass) {
      await next();
    } else {
      const token = ctx.header.authorization;  // 获取jwt, Bearer开头的
      // 例子: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoyfSwiZXhwIjoxNTM5NTk4NTI4LCJpYXQiOjE1Mzk1OTQ5Mjh9.D8vXgDTDQNj7D6m9tH4dsq6xGjA7BCoecLT-qrCNrkc

      if (token) {
        let payload = await jsonwebtoken.verify(token.split(' ')[1], secret);
        // 解密，获取payload存入ctx
        if (payload && payload.data && payload.data.id) {
          ctx.user = {
            id: payload.data.id
          };
          await next();
        } else {
          resTokenErr(ctx, 'token失效2');
        }
      } else {
        resTokenErr(ctx, 'token失效3');
      }
    }
  } catch(err) {
    resTokenErr(ctx, 'token失效4');
  }
});

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
app.use(register.routes(), register.allowedMethods());
app.use(index.routes(), index.allowedMethods());
app.use(books.routes());
app.use(review.routes());
app.use(comment.routes());
app.use(login.routes(), login.allowedMethods());
app.use(borrowBook.routes(), borrowBook.allowedMethods());
app.use(user.routes());
app.use(setCompany.routes());
app.use(bookType.routes());
app.use(personnel.routes());
app.use(adminLogin.routes(), adminLogin.allowedMethods());
app.use(upload.routes());

// error-handling
app.on('error', (err, ctx) => {
  console.error('*********************************errorStart*************************************');
  console.error('server error:');
  console.error(err);
  console.error(ctx);
  console.error('***********************************errorEnd*************************************');
});

module.exports = app
