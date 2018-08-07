const router = require('koa-router')();
const uuid = require('node-uuid');
const userModel = require('../../models/user');
const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const {resSuccess, resFailure, parameterErr} = require('../../public/js/route');

/**
* @api {post} /login 用户登录接口
* @apiDescription 登录接口 - 史沐卉
* @apiGroup users
* @apiParam {email} string 邮箱
* @apiParam {password} sting 密码
* @apiSuccess {int} code 成功: 0, 失败: 1
* * @apiSuccess {string} msg 请求成功/失败
* * @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: {
        id: 2,
        token: '085a3a43-7a4d-4dfc-b8d6-b56f07a8c4d1',
        name: 'shimuhui'
      }
*  }
* @apiSampleRequest http://localhost:3000/login
* @apiVersion 1.0.0
*/

router.get('/login', async (ctx) => {
  try {
    const data = ctx.request.body;

    if (!data.email || data.email == '') {
      parameterErr(ctx, 'email参数不能为空');
      return;
    }
    if (!data.password || data.password == '') {
      parameterErr(ctx, 'password参数不能为空');
      return;
    }

    let selectResult = await userModel.selectData({
      email: data.email
    });

    if (selectResult.length == 1 && selectResult[0].reg_status == 1) {

      // 创建 md5 算法加密
      let md5 = crypto.createHash('md5');
      // hex十六进制
      md5.update(data.password);
      let md5Password = md5.digest('hex');

      if (md5Password && md5Password == selectResult[0].password) {
        // let token = uuid.v4();
        // 获取token
        let token = jsonwebtoken.sign({
          data: {id: selectResult[0].id},
          // 设置 token 过期时间 60 seconds * 60 minutes = 1 hour
          exp: Math.floor(Date.now() / 1000) + (60 * 60),
        }, 'shared-secret');

        let loginResult = await userModel.updateData({
          token: token
        }, {
          id: selectResult[0].id
        });

        if (loginResult == 1) {
          resSuccess(ctx, {
            token: token,
            name: selectResult[0].name,
          });
        } else {
          resFailure(ctx, '登录失败');
        }
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
