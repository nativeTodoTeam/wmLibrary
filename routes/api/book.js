const router = require('koa-router')();
const bookModel = require('../../models/books');
const {resSuccess, resFailure, parameterErr} = require('../../public/js/route');


/**
* @api {post} /addbook 添加书籍
* @apiDescription 赵晓彤
* @apiGroup Book
* @apiParam {int} type 书籍分类
* @apiParam {string} title 书籍名称
* @apiParam {string} author 书籍作者
* @apiParam {string} content 书籍简介
* @apiParam {string} url 书籍封面
* @apiSuccess {int} code 成功: 0, 失败: 1
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: {}
*  }
* 
* @apiVersion 1.0.0
*/

router.post('/addbook', async (ctx, next) => {
  // let _con = ctx.query;
  let _con = ctx.request.body;
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
* @api {get} /bookList 所有书籍列表
* @apiDescription 赵晓彤
* @apiGroup Book
* @apiParam {int} type 书籍分类
* @apiParam {int} pageSize 条数
* @apiParam {int} pageNo 页码
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
*
* @apiVersion 1.0.0
*/

<<<<<<< HEAD
router.get('/bookList', async (ctx, next) => {
  // let _query = ctx.querystring;
  let _query = ctx.request.body;
 
=======
router.get('/findBookList', async (ctx, next) => {
  let _query = ctx.querystring;
  // let _query = ctx.request.body;

>>>>>>> 567f01f3c956691615f5dfc70f77ad0f4a12b85a
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


/**
* @api {GET} /bookDetails?bookId=1 书详细信息接口
* @apiGroup Book
* @apiDescription 汪小岗
* @apiParam {Number} bookId 书籍id (必填)
*
* @apiSuccess {Number} code 成功: 1, 失败: 0, 参数错误: 2
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {string} data 返回数据 00: 书籍不存在
* @apiSuccessExample {json} Success-Response:
* {
    code: 1,
    msg: '请求成功',
    data: {
      "id": 4,
      "type_id": 1,
      "title": "JavaScript设计模式",
      "author": "Addy Osmani",
      "url": null,
      "content": "设计模式的样式",
      "create_time": "2018-07-23T22:29:45.000Z",
      "update_time": "2018-07-23T22:29:45.000Z",
      "status": null
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

  await bookModel.Book.findById(data.bookId)
          .then((res) => {
            if (res && res.dataValues) {
              resSuccess(ctx, res.dataValues)
            } else {
              resSuccess(ctx, '00')
            }
          })
          .catch((err) => {
            resFailure(ctx, err);
          })

}

router.get('/bookDetails', getBookDetails);

module.exports = router;
