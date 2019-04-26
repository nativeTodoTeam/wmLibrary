const Router = require('koa-router');
const usersModel = require('../../../models/user');
const companyModel = require('../../../models/company_types');
const crypto = require('crypto');
const Utils = require('../../../utils/index');

const {
  resSuccess,
  resFailure,
  parameterErr
} = require('../../../public/js/route');

var router = new Router();

/**
* @api {post} /api/user/reg 用户注册接口(V1.0.0)(已改)
* @apiGroup users
* @apiDescription Author:汪小岗
* @apiParam {string} name 真实姓名
* @apiParam {string} phone 手机号
* @apiParam {string} email 邮箱
* @apiParam {string} position 职务
* @apiParam {Number} company_id 所属分公司
* @apiParam {string} password 密码
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
router.post('/api/user/reg', async(ctx) => {

  let data = ctx.request.body;

  try {

    // 判断参数是否为空
    if (!data.name || data.name == '') {
      parameterErr(ctx, 'name参数不能为空');
      return;
    }

    if (!data.phone || data.phone == '') {
      parameterErr(ctx, 'phone参数不能为空');
      return;
    }

    if (!data.email || data.email == '') {
      parameterErr(ctx, 'email参数不能为空');
      return;
    }

    if (!data.position || data.position == '') {
      parameterErr(ctx, 'position参数不能为空');
      return;
    }

    if (!data.company_id || data.company_id == '') {
      parameterErr(ctx, 'company_id参数不能为空');
      return;
    }

    if (!data.password || data.password == '') {
      parameterErr(ctx, 'password参数不能为空');
      return;
    }

    // 格式验证
    if (!Utils.isChineseAndEnglish(data.name)) {
      parameterErr(ctx, '姓名格式不正确');
      return;
    }

    if (!Utils.isValidMobileNo(data.phone)) {
      parameterErr(ctx, '手机号格式不正确');
      return;
    }

    if (!Utils.isEmail(data.email)) {
      parameterErr(ctx, '邮箱格式不正确');
      return;
    }

    if (!Utils.isChineseAndEnglish(data.position)) {
      parameterErr(ctx, '职务格式不正确');
      return;
    }

    let selectCompany = await companyModel.selectData({
      id: data.company_id
    });

    if (selectCompany.length == 1) {
      let selectResult = await usersModel.selectData({
        email: data.email
      });

      if (selectResult.length == 1 && selectResult[0].reg_status == 1) {
        resFailure(ctx, '邮箱已经注册');
      } else {
        // 创建 md5 算法加密
        let md5 = crypto.createHash('md5');
        // hex十六进制
        md5.update(data.password);
        let md5Password = md5.digest('hex');
  
        let userResult = await usersModel.insertData({
          name: data.name,
          phone: data.phone,
          email: data.email,
          position: data.position,
          company_id: data.company_id,
          password: md5Password,
          status: 0,
          reg_status: 1
        });
  
        if (userResult) {
          resSuccess(ctx, '操作成功');
        } else {
          resFailure(ctx, '操作失败');
        }
      }
    } else {
      parameterErr(ctx, '所属分公司不存在');
      return;
    }
  } catch (err) {
    resFailure(ctx, err)
  }
});

/**
* @api {post} /api/user/reg/setPassword 用户设置密码接口(暂时废弃不用)
* @apiGroup users
* @apiDescription Author:汪小岗
* @apiParam {string} password 密码
* @apiParam {string} confirmPassword 确认密码
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

router.post('/api/user/reg/setPassword', setPassword);

module.exports = router
