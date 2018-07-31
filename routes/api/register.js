const Router = require('koa-router');
const usersModel = require('../../models/user');
const crypto = require('crypto');
const Utils = require('../../utils/index');

const routerConfig = require('../../public/js/route');

var router = new Router();

const registerView = async (ctx, next) => {
  await ctx.render('reg');
};

/**
* @api {post} /reg 用户注册接口
* @apiGroup users
* @apiDescription Author:汪小岗
* @apiParam {string} name 真实姓名 (必填)
* @apiParam {string} phone 手机号 (必填)
* @apiParam {string} email 邮箱 (必填)
* @apiParam {string} position 职务 (必填)
* @apiParam {Number} company_id 所属分公司 (必填)
*
* @apiSuccess {Number} code 成功: 1, 失败: 0, 参数错误: 2
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

  let data = JSON.parse(ctx.request.body);

  try {

    // 判断参数是否为空
    if (!data.name || !data.phone || !data.email || !data.position ||
        !data.company_id) {
      routerConfig.parameterErr(ctx, {});
      return;
    }

    // 格式验证
    if (!Utils.isChineseAndEnglish(data.name)) {
      routerConfig.parameterErr(ctx, '姓名格式不正确');
      return;
    }

    if (!Utils.isEmail(data.email)) {
      routerConfig.parameterErr(ctx, '邮箱格式不正确');
      return;
    }

    if (!Utils.isValidMobileNo(data.phone)) {
      routerConfig.parameterErr(ctx, '手机号格式不正确');
      return;
    }

    if (!Utils.isChineseAndEnglish(data.position)) {
      routerConfig.parameterErr(ctx, '职务格式不正确');
      return;
    }

    if (!Utils.isEmail(data.email)) {
      routerConfig.parameterErr(ctx, '不是公司邮箱');
      return;
    }

    // 邮箱验证状态
    let email_status = '00';

    // 验证邮箱
    await usersModel.Users.findAll({
      where: {
        email: data.email
      }
    })
      .then((res) => {

        // 检验email是否所属本公司  00：不属于
        if (res.length == 1) {

          //检验该email是否已注册  01:已注册、02:未注册
          if (res[0].dataValues.reg_status == 1) {
            email_status = '01';
            routerConfig.resSuccess(ctx, '01');
          } else {
            email_status = '02';
          }

        } else {
          email_status = '00';
          routerConfig.resSuccess(ctx, '00');
        }

      })
      .catch((err) => {
        routerConfig.resFailure(ctx, err);
      })

    // 若邮箱验证不符则退出
    if (email_status == '00' || email_status == '01') {
      return;
    }

    // 将注册状态标记为已注册
    data.reg_status = 1;

    // 注册更新用户信息
    await usersModel.Users.update(data, {
      where: {
        email: data.email
      },
      silent: true
    })
      .then((res) => {
        routerConfig.resSuccess(ctx, '注册成功')
      })
      .catch((err) => {
        routerConfig.resFailure(ctx, err)
      })
  } catch (err) {
    routerConfig.resFailure(ctx, err)
  }

};


const setPasswordView = async (ctx) => {
  await ctx.render('setPassword')
}

/**
* @api {post} /reg/setPassword 用户设置密码接口
* @apiGroup users
* @apiDescription Author:汪小岗
* @apiParam {string} password 密码 (必填)
* @apiParam {string} confirmPassword 确认密码 (必填)
*
* @apiSuccess {Number} code 成功: 1, 失败: 0, 参数错误: 2
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
* {
    code: 1,
    msg: '请求成功',
    data: {}
* }
* @apiVersion 1.0.0
*/

// 密码设置接口
const setPassword = async (ctx) => {
  let data = JSON.parse(ctx.request.body);

  // 创建 md5 算法加密
  let md5 = crypto.createHash('md5');

  try {

    if (data.password && data.confirmPassword) {

      if (data.password === data.confirmPassword) {

        // hex十六进制
        md5.update(data.password);
        let md5Password = md5.digest('hex');

        await usersModel.Users.update({
          password: md5Password
        }, {
          where: {
            id: 3,
          },
          silent: true
        })
          .then((res) => {
            routerConfig.resSuccess(ctx, '修改成功')
          })
          .catch((err) => {
            routerConfig.resFailure(ctx, '修改失败')
          })
      } else {
        routerConfig.parameterErr(ctx, {})
      }

    } else {
      routerConfig.parameterErr(ctx, {})
    }
  } catch (err) {
    routerConfig.resFailure(ctx, err)
  }

}

router.get('/reg', registerView)
router.post('/reg', register);
router.get('/reg/setPassword', setPasswordView);
router.post('/reg/setPassword', setPassword);

module.exports = router
