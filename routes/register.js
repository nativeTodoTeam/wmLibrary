const Router = require('koa-router');
const Sequelize = require('sequelize');
const devConfig = require('../config/dev');
const usersModel = require('../models/user');
const crypto = require('crypto');

var router = new Router();

// 注册
const registerView = async (ctx, next) => {
  await ctx.render('reg');
};

const register = async (ctx, next) => {
  console.log('正在注册！！！');
  console.log(ctx.request.body)

  let data = JSON.parse(ctx.request.body);
  console.log(data)
  await usersModel.update(data, {
    where: {
      id: 3
    },
    fields: ['name', 'email', 'phone', 'url'],
    silent: true
  })
    .then((res) => {
      console.log('更新成功：', res)
      ctx.response.status = 200;
      ctx.response.body = '1';
    })
    .catch((err) => {
      console.log('更新失败：', err)
      ctx.response.status = 200;
      ctx.response.body = '0';
    })
};

// 设置密码
const setPasswordView = async (ctx) => {
  await ctx.render('setPassword')
}

const setPassword = async (ctx) => {
  let data = JSON.parse(ctx.request.body);

  // 创建 md5 算法加密
  let md5 = crypto.createHash('md5');
  console.log(data)

  if (data.password && data.confirmPassword) {

    if (data.password === data.confirmPassword) {

      console.log('确认密码正确，将要进行加密')

      // hex十六进制
      md5.update(data.password);
      let md5Password = md5.digest('hex');

      await usersModel.update({
        password: md5Password
      }, {
        where: {
          id: 3,
        },
        silent: true
      })
        .then((res) => {
          ctx.res.status = 200;
          ctx.response.body = '1';
        })
        .catch((res) => {
          ctx.res.status = 200;
          ctx.response.body = '0';
        })
    } else {
      ctx.response.body = '0';
    }

  } else {
    ctx.res.status = 200;
    ctx.response.body = '0';
  }

}

// 邮箱验证
const verifyEmail = async (ctx) => {
  let data = ctx.request.query;

  //  为空判断
  if (!data) {
    ctx.res.status = 200;
    ctx.response.body = '0';
    return;
  }

  await usersModel.findAll({
    where: {
      email: data.email
    }
  })
    .then((res) => {

      // 检验email是否所属本公司  00：不属于
      if (res.length == 1) {

        //检验该email是否已注册  01:已注册、00:未注册
        if (res[0].dataValues.name) {
          ctx.res.status = 200;
          ctx.response.body = '01';
          return;
        } else {
          ctx.res.status = 200;
          ctx.response.body = '02';
          return;
        }

      } else {
        ctx.res.status = 200;
        ctx.response.body = '00';
      }

    }).catch((err) => {
      console.log(err)
    })
}

router.get('/reg', registerView)
router.post('/reg', register);
router.get('/reg/setPassword', setPasswordView);
router.post('/reg/setPassword', setPassword);
router.get('/reg/verifyEmail', verifyEmail);

module.exports = router
