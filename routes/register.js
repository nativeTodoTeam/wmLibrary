const Router = require('koa-router');
const Sequelize = require('sequelize');
const devConfig = require('../config/dev');
const usersModel = require('../models/user');
const crypto = require('crypto');

const routerConfig = require('../public/js/route');

var router = new Router();


const registerView = async (ctx, next) => {
  await ctx.render('reg');
};

// 注册接口
const register = async (ctx, next) => {
  console.log('正在注册！！！');

  let data = JSON.parse(ctx.request.body);

  // 判断参数是否为空
  if (!data.name || !data.phone || !data.email || !data.position ||
      !data.company_id) {
    routerConfig.parameterErr(ctx);
    return;
  }

  data.reg_status = 1;

  await usersModel.update(data, {
    where: {
      id: 3
    },
    silent: true
  })
    .then((res) => {
      console.log('更新成功：', res)
      routerConfig.resSuccess(ctx, '注册成功')
    })
    .catch((err) => {
      console.log('更新失败：', err)
      routerConfig.resFailure(ctx, '注册失败')
    })
};


const setPasswordView = async (ctx) => {
  await ctx.render('setPassword')
}

// 密码设置接口
const setPassword = async (ctx) => {
  let data = JSON.parse(ctx.request.body);

  // 创建 md5 算法加密
  let md5 = crypto.createHash('md5');

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
          routerConfig.resSuccess(ctx)
        })
        .catch((res) => {
          routerConfig.resFailure(ctx)
        })
    } else {
      routerConfig.parameterErr(ctx)
    }

  } else {
    routerConfig.parameterErr(ctx)
  }

}

// 邮箱验证接口
const verifyEmail = async (ctx) => {
  let data = ctx.request.query;

  //  为空判断
  if (!data.email) {
    routerConfig.parameterErr(ctx)
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
        if (res[0].dataValues.reg_status == 1) {
          routerConfig.resSuccess(ctx, '01')
          return;
        } else {
          routerConfig.resSuccess(ctx, '02')
          return;
        }

      } else {
        routerConfig.resSuccess(ctx, '00')
      }

    }).catch((err) => {
      routerConfig.resFailure(ctx)
    })
}

router.get('/reg', registerView)
router.post('/reg', register);
router.get('/reg/setPassword', setPasswordView);
router.post('/reg/setPassword', setPassword);
router.get('/reg/verifyEmail', verifyEmail);

module.exports = router
