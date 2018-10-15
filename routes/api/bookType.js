const Router = require('koa-router');
const bookTypeModel = require('../../models/book_types');
const Utils = require('../../utils/index');
const routerConfig = require('../../public/js/route');

var router = new Router();

/**
* @api {GET} /api/bookType 书籍分类列表接口(V1.0.0)
* @apiGroup bookType
* @apiDescription Author:汪小岗
*
* @apiSuccess {Number} code 成功: 1, 失败: 0, 参数错误: 2
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {object} data 返回数据
* @apiSuccessExample {json} Success-Response:
* {
    code: 1,
    msg: '请求成功',
    list: []
* }
* @apiVersion 1.0.0
*/
const getBookTypeInfo = async (ctx) => {

  // let adminUserId = ctx.user.id;

  try {

    // if (!adminUserId) {
    //   routerConfig.parameterErr(ctx, {});
    //   return;
    // }

    let bookTypeRes = await bookTypeModel.selectData({});
    ctx.response.body = {
      code: 1,
      msg: '请求成功',
      list: bookTypeRes
    }

  } catch (err) {
    routerConfig.resFailure(ctx, err)
  }
}

/**
* @api {POST} /api/bookType 更新书籍分类信息接口(V1.0.0)
* @apiGroup bookType
* @apiParam {int} id 书籍分类id
* @apiParam {string} name 书籍分类名称
* @apiDescription Author:汪小岗
*
* @apiSuccess {Number} code 成功: 1, 失败: 0, 参数错误: 2
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {object} data 返回数据
* @apiSuccessExample {json} Success-Response:
* {
    code: 1,
    msg: '请求成功',
* }
* @apiVersion 1.0.0
*/
const updateBookTypeInfo = async (ctx) => {
  let data = ctx.request.body;
  // let adminUserId = ctx.user.id;

  try {

    // if (!adminUserId) {
    //   routerConfig.parameterErr(ctx, {});
    //   return;
    // }

    if (!data.name || data.name == '') {
      routerConfig.parameterErr(ctx, {});
      return;
    }

    let bookTypeRes = await bookTypeModel.selectData({
      name: data.name
    });

    if (bookTypeRes.length > 0) {
      ctx.response.body = {
        code: 1,
        msg: '分类名已存在',
      }

      return;
    }


    let res = await bookTypeModel.updateData({
      name: data.name
    }, { id: data.id });

    if (res == 1 || res == 0) {
      routerConfig.resSuccess(ctx, '操作成功');
    } else {
      routerConfig.resFailure(ctx, '操作失败');
    }

  } catch (err) {
    routerConfig.resFailure(ctx, err)
  }
}


/**
* @api {POST} /api/addBookType 添加书籍分类接口(V1.0.0)
* @apiGroup bookType
* @apiParam {string} name 书籍分类名称
* @apiDescription Author:汪小岗
*
* @apiSuccess {Number} code 成功: 1, 失败: 0, 参数错误: 2
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {object} data 返回数据
* @apiSuccessExample {json} Success-Response:
* {
    code: 1,
    msg: '请求成功',
* }
* @apiVersion 1.0.0
*/
const addBookType = async (ctx) => {
  let data = ctx.request.body;
  // let adminUserId = ctx.user.id;

  try {

    // if (!adminUserId) {
    //   routerConfig.parameterErr(ctx, {});
    //   return;
    // }
    if (!data.name || data.name == '') {
      routerConfig.parameterErr(ctx, {});
      return;
    }

    let bookTypeRes = await bookTypeModel.selectData({
      name: data.name
    });

    if (bookTypeRes.length > 0) {
      ctx.response.body = {
        code: 1,
        msg: '分类名已存在',
      }

      return;
    }

    let res = await bookTypeModel.insertData({
      name: data.name,
      status: 0,
    });

    if (res && res.name) {
      routerConfig.resSuccess(ctx, '操作成功');
    } else {
      routerConfig.resFailure(ctx, '操作失败');
    }

  } catch (err) {
    routerConfig.resFailure(ctx, err)
  }
}


router.get('/api/bookType', getBookTypeInfo);
router.post('/api/bookType', updateBookTypeInfo);
router.post('/api/addBookType', addBookType);


module.exports = router
