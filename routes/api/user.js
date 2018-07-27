const Router = require('koa-router');
const usersModel = require('../../models/user');
const Utils = require('../../utils/index');
const routerConfig = require('../../public/js/route');

var router = new Router();

const mCenterView = async (ctx) => {
  await ctx.render('mCenter');
}

/**
* @api {GET} /userInfo?userId=3 获取用户信息接口
* @apiGroup users
* @apiDescription Author:汪小岗
* @apiParam {Number} userId 用户id (必填)
*
* @apiSuccess {Number} code 成功: 1, 失败: 0, 参数错误: 2
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {string} data 返回数据
* @apiSuccessExample {json} Success-Response:
* {
    code: 1,
    msg: '请求成功',
    data: {
      "id": 3,
      "name": "xiaogang",
      "email": "xiaogang@frogshealth.com",
      "phone": "18191253790",
      "url": "haha",
      "signature": null,
      "company_id": 0,
      "status": null,
      "create_time": null,
      "update_time": null,
      "position": "前端工程师",
      "reg_status": 1
    }
* }
* @apiVersion 1.0.0
*/
const getUserInfo = async (ctx) => {
  let data = ctx.request.query;

  if (!data.userId) {
    routerConfig.parameterErr(ctx, {});
    return;
  }

  await usersModel.findById(data.userId)
          .then((res) => {
            let data = {
              "id": res.dataValues.id,
              "name": res.dataValues.name,
              "email": res.dataValues.email,
              "phone": res.dataValues.phone,
              "url": res.dataValues.url,
              "signature": res.dataValues.signature,
              "company_id": res.dataValues.company_id,
              "status": res.dataValues.status,
              "create_time": res.dataValues.create_time,
              "update_time": res.dataValues.update_time,
              "position": res.dataValues.position,
              "reg_status": res.dataValues.reg_status
            }
            routerConfig.resSuccess(ctx, data)
          })
          .catch((err) => {
            routerConfig.resFailure(ctx, err)
          })

}

/**
* @api {POST} /userInfo 更新用户信息接口
* @apiGroup users
* @apiDescription Author:汪小岗
* @apiParam {Number} userId 用户id (必填)
* @apiParam {string} signature 签名 (选填至少一项)
* @apiParam {string} position 职务 (选填至少一项)
* @apiParam {Number} company_id 所属分公司 (选填至少一项)
*
* @apiSuccess {Number} code 成功: 1, 失败: 0, 参数错误: 2
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {string} data 返回数据
* @apiSuccessExample {json} Success-Response:
* {
    code: 1,
    msg: '请求成功',
    data: {}
* }
* @apiVersion 1.0.0
*/
const updateUserInfo = async (ctx) => {
  let data = ctx.request.body;

  if (!data.userId) {
    routerConfig.parameterErr(ctx, {});
    return;
  }

  // 格式验证
  if (!Utils.isChineseAndEnglish(data.position)) {
    routerConfig.parameterErr(ctx, '职务格式不正确');
    return;
  }

  if (data.signature && ((data.signature.length > 16) ||
    (data.signature.indexOf('\n') > -1))) {
    routerConfig.parameterErr(ctx, '签名格式不正确');
    return;
  }

  // 不可修改字段
  if (data.name || data.phone || data.email) {
    routerConfig.parameterErr(ctx, {});
    return;
  }

  // 判断参数是否全为空
  if (!data.position && !data.company_id && !data.signature) {
    routerConfig.parameterErr(ctx, {});
    return;
  }

  let _data = {};

  for(key in data) {
    if (key !== 'id') {
      _data[key] = data[key];
    }
  }

  await usersModel.update(_data, {
    where: {
      id: data.userId,
    }
  })
    .then((res) => {
      routerConfig.resSuccess(ctx, {})
    })
    .catch((err) => {
      routerConfig.resFailure(ctx, err)
    })

}


/**
* @api {POST} /userOut 用户退出登录接口
* @apiGroup users
* @apiDescription Author:汪小岗
* @apiParam {Number} userId 用户id (必填)
*
* @apiSuccess {Number} code 成功: 1, 失败: 0, 参数错误: 2
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {string} data 返回数据
* @apiSuccessExample {json} Success-Response:
* {
    code: 1,
    msg: '请求成功',
    data: {}
* }
* @apiVersion 1.0.0
*/
const userOut = async (ctx) => {
  let data = ctx.request.body;

  if (!data.userId) {
    routerConfig.parameterErr(ctx, {});
    return;
  }

  let isUserId = false;

  // 查找该用户是否存在
  await usersModel.findById(data.userId)
    .then((res) => {
      if (res) {
        isUserId = true;
      } else {
        routerConfig.parameterErr(ctx, '用户不存在')
      }

    })
    .catch((err) => {
      routerConfig.resFailure(ctx, err)
    })

  if (!isUserId) {
    return;
  }

  await usersModel.update({ token: null }, {
    where: {
      id: data.userId
    }
  })
    .then((res) => {

      if (res[0] == 1) {
        routerConfig.resSuccess(ctx, {})
      }

      if (res[0] == 0) {
        routerConfig.resSuccess(ctx, '')
      }

    })
    .catch((err) => {
      routerConfig.resFailure(ctx, err)
    })

}

router.get('/mCenter', mCenterView);
router.get('/userInfo', getUserInfo);
router.post('/updateUserInfo', updateUserInfo);
router.post('/userOut', userOut);

module.exports = router
