const router = require('koa-router')();
const bookModel = require('../../../models/books');
const bookTypesModel = require('../../../models/book_types');
const borrowBookModel = require('../../../models/borrow_books');
const db = require('../../../config/db').sequelize;
const {resSuccess, resFailure, parameterErr} = require('../../../public/js/route');


/**
* @api {post} /api/admin/addbook 添加书籍(V1.0.0)
* @apiDescription 赵晓彤
* @apiGroup Book
* @apiParam {Number} type 书籍分类
* @apiParam {string} title 书籍名称
* @apiParam {string} author 书籍作者
* @apiParam {string} content 书籍简介
* @apiParam {string} url 书籍封面
* @apiParam {string} background 书籍背景
* @apiSuccess {Number} code 成功: 0, 失败: 1
* @apiSuccess {string} msg 添加成功/失败
* @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '添加成功',
*  }
*
* @apiVersion 1.0.0
*/

router.post('/api/admin/addbook', async (ctx, next) => {
  // let _con = ctx.query;
  let _con = ctx.request.body;

  try {

  	// 判断这些都不能为空
  	if (!_con.type || _con.type == '') {
  	  parameterErr(ctx, {});
      return;
  	}

    if (!_con.title || _con.title == '') {
  	  parameterErr(ctx, {});
      return;
  	}

    if (!_con.author || _con.author == '') {
  	  parameterErr(ctx, {});
      return;
    }

    if (!_con.content || _con.content == '') {
      parameterErr(ctx, {});
      return;
    }

    // if (!_con.background || _con.background == '') {
    //   parameterErr(ctx, {});
    //   return;
    // }

    await bookModel.Book.create({
      type_id: _con.type,
      title: _con.title,
      author: _con.author,
      url: _con.url,
      content: _con.content,
      background: _con.background,
      status: 0,
    }).then(result => {

      ctx.response.status = 200;
      ctx.response.body = {
        code: 1,
        msg: '添加成功',
      }
    });

  } catch (err) {
    resFailure(ctx, err);
  }
});

/**
* @api {get} /api/bookList 书籍列表(V1.0.0)
* @apiDescription author:汪小岗
* @apiGroup Book
* @apiParam {Number} [type_id] 书籍分类
* @apiParam {Number} [bookStatus]  书籍状态
* @apiParam {Number} [pageSize] 分页大小。默认200
* @apiParam {Number} [pageNo] 页码。默认第一页
*
* @apiSuccess {Number} code 成功: 0, 失败: 1
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: [
      	{
    		  type_id: '书籍分类',
    		  title: '书籍名称',
    		  author: '书籍作者',
    		  content: '书籍简介',
          background: '书籍背景',
    		  url: '书籍封面',
    		  bookStatus: '书籍状态 0: 上架 1: 下架',
          bookTypeName: "书籍分类名称"
        },
        ...
      ],
      pageTurn: {
    		pageSize: 2,
    		pageNo: 1,
    		firstPage: 1,
    		nextPage: 2
      }
*  }
*
* @apiVersion 1.0.0
*/

router.get('/api/bookList', async (ctx, next) => {
  let _query = ctx.query;

  try {
    let sql = '';

    // 关联查询书籍分类、条件查询（书籍分类、书籍状态）
    if (_query) {
      // sql = 'select a.id as bookId,a.type_id,a.title,a.author,a.url,' +
      // 'a.content,a.background,a.create_time,a.update_time,a.status as ' +
      // 'bookStatus, b.name as bookTypeName from books a,book_types b ' +
      // (_query.type_id || _query.bookStatus ? 'where ' : '') +
      // (_query.type_id ? `type_id=${_query.type_id} and ` : '') +
      // (_query.bookStatus ? `a.status=${_query.bookStatus}` : '') +
      // ' and a.type_id=b.id ' +
      // `limit ${ (_query.pageNo ? _query.pageNo - 1 : 0) *
      //           (_query.pageSize ? _query.pageSize : 200)
      //         }, ${_query.pageSize ? _query.pageSize : 200}`;

      sql = 'select a.id as bookId,a.type_id,a.title,a.author,a.url,' +
      'a.content,a.background,a.create_time,a.update_time,a.status as ' +
      'bookStatus, b.name as bookTypeName from books a,book_types b ' +
      (_query.type_id || _query.bookStatus ? 'where ' : '') +
      (_query.type_id ? `type_id=${_query.type_id} and ` : '') +
      (_query.bookStatus ? `a.status=${_query.bookStatus}` : '') +
      ' and a.type_id=b.id order by a.update_time desc ' +
      `limit ${ (_query.pageNo ? _query.pageNo - 1 : 0) *
                (_query.pageSize ? _query.pageSize : 200)
              }, ${_query.pageSize ? _query.pageSize : 200}`;
    }

    if (sql == '') {
      parameterErr(ctx, {});
      return;
    }

    await db.query(sql)
      .spread(result => {
        ctx.response.status = 200;
        ctx.response.body = {
          code: 1,
          msg: '请求成功',
          data: result,
          pageTurn: {
    		  	pageSize: _query.pageSize ? parseInt(_query.pageSize) : 200,
    		  	pageNo: _query.pageNo ? parseInt(_query.pageNo) : 1,
    		  	firstPage: _query.pageNo ? parseInt(_query.pageNo) : 1,
    		  	nextPage: _query.pageNo ? parseInt(_query.pageNo) + 1 : 2,
    		  }
        };
      })

  } catch(err) {
  	resFailure(ctx, err);
  }
});


/**
* @api {GET} /api/bookDetails?bookId=1 书详细信息接口(V1.0.0)
* @apiGroup Book
* @apiDescription Author:汪小岗
* @apiParam {Number} bookId 书籍id
*
* @apiSuccess {Number} code 成功: 1, 失败: 0, 参数错误: 2
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {string} data 返回数据
* @apiSuccessExample {json} Success-Response:
* {
    code: 1,
    msg: '请求成功',
    data: {
      "bookId": 4,
      "type_id": 1,
      "title": "JavaScript设计模式",
      "author": "Addy Osmani",
      "url": null,
      "content": "设计模式的样式",
      "create_time": "2018-07-23T22:29:45.000Z",
      "update_time": "2018-07-23T22:29:45.000Z",
      "bookStatus": null,
      "bookTypeName": "艺术设计",
    }
* }
* @apiVersion 1.0.0
*/
const getBookDetails = async (ctx) => {
  let data = ctx.request.query;

  if (!data.bookId) {
    parameterErr(ctx, {});
    return;
  }

  try {

    let sql = 'select a.id as bookId,a.type_id,a.title,a.author,a.url,' +
    'a.content,a.create_time,a.update_time,a.status as bookStatus,' +
    'b.name as bookTypeName from books a,book_types b where' +
    ' a.id=' + data.bookId + ' and a.type_id=b.id';

    await db.query(sql)
      .spread(result => {
        ctx.response.status = 200;
        ctx.response.body = {
          code: 1,
          msg: '请求成功',
          data: result
        };
      })

  } catch (err) {
    resFailure(ctx, err);
  }


}


/**
* @api {POST} /api/admin/bookDetails 更新书籍接口(V1.0.0)
* @apiGroup Book
* @apiDescription Author:汪小岗
* @apiParam {Number} bookId 书籍id
* @apiParam {Number} [typeId] 书籍分类
* @apiParam {String} [title] 书籍名称
* @apiParam {String} [author] 书籍作者
* @apiParam {String} [content] 书籍简介
* @apiParam {String} [url] 书籍封面
*
* @apiSuccess {Number} code 成功: 1, 失败: 0, 参数错误: 2
* @apiSuccess {string} msg 更新成功/失败
* @apiSuccessExample {json} Success-Response:
* {
    code: 1,
    msg: '更新成功',
* }
* @apiVersion 1.0.0
*/
const updateBookDetails = async (ctx) => {
  let data = ctx.request.body;

  if (!data.bookId) { parameterErr(ctx, {}); return; };

  try {

    let res = await bookModel.updateData({
      type_id: data.typeId ? data.typeId : null,
      title: data.title ? data.title : null,
      author: data.author ? data.author : null,
      url: data.url ? data.url : null,
      content: data.content ? data.content : null,
      background: data.background ? data.background : null,
    }, {
      id: data.bookId,
    });

    if (res == 0 || res == 1) {
      resSuccess(ctx, '更新成功')
    } else {
      resFailure(ctx, err);
    }

  } catch (err) {
    resFailure(ctx, err);
  }

}


/**
* @api {POST} /api/admin/offlineBook 书籍下架接口(V1.0.0)
* @apiGroup Book
* @apiDescription Author:汪小岗
* @apiParam {Number} bookId 书籍id
*
* @apiSuccess {Number} code 成功: 1, 失败: 0, 参数错误: 2
* @apiSuccess {string} msg 下架成功/失败
* @apiSuccessExample {json} Success-Response:
* {
    code: 1,
    msg: '下架成功',
* }
* @apiVersion 1.0.0
*/
const offlineBook = async (ctx) => {
  let data = ctx.request.body;

  if (!data.bookId) { parameterErr(ctx, {}); return; };

  try {

    let isBorrowBook = await borrowBookModel.selectData({
      book_id: data.bookId,
    });

    if (isBorrowBook.length > 0) {
      ctx.response.status = 200;
      ctx.response.body = {
        code: 0,
        msg: '该书已有用户借阅！！！',
      };

      return;
    }


    let res = await bookModel.updateData({
      status: 1,
    }, {
      id: data.bookId,
    });

    if (res == 0 || res == 1) {
      resSuccess(ctx, '下架成功')
    } else {
      resFailure(ctx, err);
    }

  } catch (err) {
    resFailure(ctx, err);
  }

}

router.get('/api/bookDetails', getBookDetails);
router.post('/api/admin/bookDetails', updateBookDetails);
router.post('/api/admin/offlineBook', offlineBook);

module.exports = router;
