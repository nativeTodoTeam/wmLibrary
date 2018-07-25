const router = require('koa-router')();
const bookModel = require('../../models/books');
const {resSuccess, resFailure, parameterErr} = require('../../public/js/route');


/**
* @api {post} /addbook
* @apiDescription 测试post接口
* @apiGroup 添加书籍
*
* @apiParam {int} type 书籍分类
* @apiParam {string} title 书籍名称
* @apiParam {string} author 书籍作者
* @apiParam {string} content 书籍简介
* @apiParam {string} url 书籍封面
*
* @apiSuccess {int} code 成功: 0, 失败: 1
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: {}
*  }
* @apiSampleRequest http://localhost:3000/addbook
* @apiVersion 1.0.0
*/

router.get('/addbook', async (ctx, next) => {
  console.log(ctx.query, 'addbook ctx');
  let _con = ctx.query;
  try {
  	
  	// 判断这些都不能为空
  	if (!_con.type || _con.type == '') {
  	  parameterErr(ctx, {});
  	} else if (!_con.title || _con.title == '') {
  	  parameterErr(ctx, {});

  	} else if (!_con.author || _con.author == '') {
  	  parameterErr(ctx, {});

    } else if (!_con.content || _con.content == '') {
      parameterErr(ctx, {});

    } else {

	    await bookModel.Book.create({
	      type_id: _con.type,
	      title: _con.title,
	      author: _con.author,
	      url: _con.url,
	      content: _con.content

	    }).then(result => {
	      console.log(result);
	    });

	    // await bookModel.deleteData({
	    //   id: 32
	    // })
	    // .then(result => {
	    //   console.log(result);
	    // })
	    // resSuccess(ctx, {});
	    ctx.response.status = 200;
	    ctx.response.body = {
		  code: 1,
		  msg: '请求成功',
		  data: {}
		}
  	}
    // await ctx.render('index');
  } catch (err) {
    resFailure(ctx, err);
  }
});

/**
* @api {post} /findBookList
* @apiDescription 测试post接口
* @apiGroup 按照类型查询书籍列表
* @apiParam {int} type 书籍分类
* @apiParam {int} pageSize 条数
*
* @apiSuccess {int} code 成功: 0, 失败: 1
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
		  url: '书籍封面',
		  status: '书籍状态 0: 上架 1: 下架'
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
* @apiSampleRequest http://localhost:3000/findBookList
* @apiVersion 1.0.0
*/

router.get('/findBookList', async (ctx, next) => {
  let _query = ctx.querystring;
  // let _query = ctx.request.body;
 
  try {
  	await bookModel.Book.findAll({
  	  where: {
  	  	type_id: parseInt(_query.type),
  	  },
  	  limit: parseInt(_query.pageSize),
  	  offset: (parseInt(_query.pageNo) - 1) * parseInt(_query.pageSize)

  	}).then(result => {
  		
	  	ctx.response.status = 200;
	    ctx.response.body = {
		  code: 1,
		  msg: '请求成功',
		  data: result,
		  pageTurn: {
		  	pageSize: parseInt(_query.pageSize),
		  	pageNo: parseInt(_query.pageNo),
		  	firstPage: parseInt(_query.pageNo),
		  	nextPage: parseInt(_query.pageNo) + 1,
		  }
		}
  	})

  } catch(err) {
  	resFailure(ctx, err);
  }
});

module.exports = router;