const router = require('koa-router')();
const adminUserModel = require('../../../models/admin_user');
const jsonwebtoken = require('jsonwebtoken');
const {
  resSuccess, resFailure, parameterErr} = require('../../../public/js/route');

/**
* @api {post} /api/admin/login 后台用户登录接口
* @apiDescription 后台用户登录接口 - 史沐卉
* @apiGroup users
* @apiParam {name} string 用户名
* @apiParam {password} sting 密码
* @apiSuccess {int} code 成功: 0, 失败: 1
* * @apiSuccess {string} msg 请求成功/失败
* * @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: {
        token: '085a3a43-7a4d-4dfc-b8d6-b56f07a8c4d1',
        name: 'shimuhui'
      }
*  }
* @apiSampleRequest http://localhost:3000/api/admin/login
* @apiVersion 1.0.0
*/

router.post('/api/admin/login', async (ctx) => {
  try {
    const data = ctx.request.body;

    if (!data.name || data.name == '') {
      parameterErr(ctx, 'name参数不能为空');
      return;
    }
    if (!data.password || data.password == '') {
      parameterErr(ctx, 'password参数不能为空');
      return;
    }

    let selectResult = await adminUserModel.selectData({
      name: data.name
    });

    if (selectResult.length == 1) {

      if (data.password == selectResult[0].password) {
        // 获取token
        let token = jsonwebtoken.sign({
          data: {id: selectResult[0].id},
          // 设置 token 过期时间 60 seconds * 60 minutes = 1 hour
          exp: Math.floor(Date.now() / 1000) + (60 * 60),
        }, 'shared-secret');

        resSuccess(ctx, {
          token: token,
          name: selectResult[0].name,
        });
      } else {
        resFailure(ctx, '密码错误');
      }
    } else {
      resFailure(ctx, '用户未注册');
    }
  } catch (err) {
    resFailure(ctx, err);
  }
});

module.exports = router;
