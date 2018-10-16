const router = require('koa-router')();
const companyModel = require('../../../models/company_types');
const {
  resSuccess, resFailure, parameterErr} = require('../../../public/js/route');

/**
* @api {post} /api/admin/addSetCompany 添加分公司接口
* @apiDescription 添加分公司接口 - 史沐卉
* @apiGroup company
* @apiParam {content} string 公司名称
* @apiSuccess {int} code 成功: 0, 失败: 1
* * @apiSuccess {string} msg 请求成功/失败
* * @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: '操作成功'
*  }
* @apiSampleRequest http://localhost:3000/api/admin/addSetCompany
* @apiVersion 1.0.0
*/

router.post('/api/admin/addSetCompany', async (ctx) => {
  try {
    const data = ctx.request.body;

    if (!data.content || data.content == '') {
      parameterErr(ctx, '分公司名称参数不能为空');
      return;
    }

    let selectResult = await companyModel.selectData({content: data.content});

    if (selectResult.length > 0) {
      resFailure(ctx, '分公司名称不能重复');
    } else {
      let addResult = await companyModel.insertData({
        content: data.content
      });

      if (addResult) {
        resSuccess(ctx, '操作成功');
      } else {
        resFailure(ctx, '操作失败');
      }
    }
  } catch (err) {
    resFailure(ctx, err);
  }
});

/**
* @api {post} /api/admin/updateSetCompany 更新分公司接口
* @apiDescription 更新分公司接口 - 史沐卉
* @apiGroup company
* @apiParam {id} int 公司id
* @apiParam {content} string 公司名称
* @apiSuccess {int} code 成功: 0, 失败: 1
* * @apiSuccess {string} msg 请求成功/失败
* * @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: '操作成功'
*  }
* @apiSampleRequest http://localhost:3000/api/admin/updateSetCompany
* @apiVersion 1.0.0
*/

router.post('/api/admin/updateSetCompany', async (ctx) => {
  try {
    const data = ctx.request.body;

    if (!data.id || data.id == '') {
      parameterErr(ctx, '分公司id参数不能为空');
      return;
    }

    if (!data.content || data.content == '') {
      parameterErr(ctx, '分公司名称参数不能为空');
      return;
    }

    let selectResult = await companyModel.selectData({id: data.id});

    if (selectResult.length != 1) {
      resFailure(ctx, '分公司id不存在');
    } else {
      let addResult = await companyModel.updateData({
        content: data.content
      }, {
        id: data.id
      });

      if (addResult) {
        resSuccess(ctx, '操作成功');
      } else {
        resFailure(ctx, '操作失败');
      }
    }
  } catch (err) {
    resFailure(ctx, err);
  }
});


/**
* @api {get} /api/admin/getCompany 获取分公司列表接口
* @apiDescription 获取分公司列表接口 - 史沐卉
* @apiGroup company
* @apiSuccess {int} code 成功: 0, 失败: 1
* * @apiSuccess {string} msg 请求成功/失败
* * @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: [{
        "id": 2,
        "content": "北京分公司23333",
        "create_time": "2018-10-15T08:08:36.000Z",
        "update_time": "2018-10-15T08:08:36.000Z"
      }]
*  }
* @apiSampleRequest http://localhost:3000/api/admin/getCompany
* @apiVersion 1.0.0
*/

router.get('/api/admin/getCompany', async (ctx) => {
  try {

    let selectResult = await companyModel.selectData({});

    if (selectResult) {
      resSuccess(ctx, selectResult);
    } else {
      resFailure(ctx, '操作失败');
    }
  } catch (err) {
    resFailure(ctx, err);
  }
});

module.exports = router;
