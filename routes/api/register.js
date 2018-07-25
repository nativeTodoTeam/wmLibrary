const Router = require('koa-router');
const usersModel = require('../models/user');
const crypto = require('crypto');

const routerConfig = require('../public/js/route');

var router = new Router();

const registerView = async (ctx, next) => {
  await ctx.render('reg');
};

/**
* @api {post} /reg 用户注册接口
* @apiGroup users
* @apiDescription 用户注册接口
* @apiParam {string} name 真实姓名
* @apiParam {string} phone 手机号
* @apiParam {string} email 邮箱
* @apiParam {string} position 职务
* @apiParam {Number} company_id 所属分公司
*
* @apiSuccess {Number} code 成功: 0, 失败: 1, 参数错误: 2
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
* {
    code: 1,
    msg: '添加成功',
    data: {}
* }
* @apiVersion 1.0.0
*/

// 注册接口
const register = async (ctx, next) => {
  console.log('正在注册！！！');

  let data = JSON.parse(ctx.request.body);

  // 判断参数是否为空
  if (!data.name || !data.phone || !data.email || !data.position ||
      !data.company_id) {
    routerConfig.parameterErr(ctx, {});
    return;
  }

  // 将注册状态标记为已注册
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

/**
* @api {post} /reg/setPassword 用户设置密码接口
* @apiGroup users
* @apiDescription 用户设置密码接口
* @apiParam {string} password 密码
* @apiParam {string} confirmPassword 确认密码
*
* @apiSuccess {Number} code 成功: 0, 失败: 1, 参数错误: 2
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
* {
    code: 1,
    msg: '添加成功',
    data: {}
* }
* @apiVersion 1.0.0
*/

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
          routerConfig.resSuccess(ctx, {})
        })
        .catch((res) => {
          routerConfig.resFailure(ctx, {})
        })
    } else {
      routerConfig.parameterErr(ctx, {})
    }

  } else {
    routerConfig.parameterErr(ctx, {})
  }

}

/**
* @api {GET} /reg/verifyEmail?email=xxx@frogshealth.com 用户邮箱验证接口
* @apiGroup users
* @apiDescription 用户邮箱验证接口
* @apiParam {string} email 邮箱
*
* @apiSuccess {Number} code 成功: 0, 失败: 1, 参数错误: 2
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {string} data 00: 不属于, 01: 已注册, 02: 未注册
* @apiSuccessExample {json} Success-Response:
* {
    code: 1,
    msg: '请求成功',
    data: '02'
* }
* @apiVersion 1.0.0
*/

// 邮箱验证接口
const verifyEmail = async (ctx) => {
  let data = ctx.request.query;

  //  为空判断
  if (!data.email) {
    routerConfig.parameterErr(ctx, {})
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

        //检验该email是否已注册  01:已注册、02:未注册
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

    })
    .catch((err) => {
      routerConfig.resFailure(ctx, {})
    })
}

router.get('/reg', registerView)
router.post('/reg', register);
router.get('/reg/setPassword', setPasswordView);
router.post('/reg/setPassword', setPassword);
router.get('/reg/verifyEmail', verifyEmail);

module.exports = router
