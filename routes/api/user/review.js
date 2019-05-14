const router = require('koa-router')();
const reviewModel = require('../../../models/review_books');
const userModel = require('../../../models/user');
const borrowModel = require('../../../models/borrow_books');
const commentModel = require('../../../models/comments');
const {resSuccess, resFailure, parameterErr} = require('../../../public/js/route');
const db = require('../../../config/db').sequelize;

/**
* @api {post} /api/user/addReviewBook 添加书心得
* @apiDescription 赵晓彤
* @apiGroup Book
* @apiParam {int} userId  用户ID
* @apiParam {int} bookId  书籍ID
* @apiParam {string} content 书籍心得
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
*
* @apiVersion 1.0.0
*/

router.post('/api/user/addReviewBook', async (ctx, next) => {
  let _con = ctx.query;
  let _userId = ctx.user.id;
  // let _con = ctx.request.body;
  try {

  	// 判断这些都不能为空
  	if (!_con.userId || _con.userId == '') {
  	  parameterErr(ctx, {});
  	} else if (!_con.bookId || _con.bookId == '') {
  	  parameterErr(ctx, {});

  	} else if (!_con.content || _con.content == '') {
  	  parameterErr(ctx, {});

    } else {

	    await reviewModel.ReviewBook.create({
	      user_id: _userId,
	      book_id: _con.bookId,
	      content: _con.content,

	    }).then(result => {

	    });

	    // 修改借书状态，3:还书并审核
	    await borrowModel.Borrow.update(
	    	{ status: 3 },
	    	{ where:{
	    	  user_id: _userId,
			    book_id: _con.bookId,
	      }}
	    )

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
* @api {get} /api/user/reviewList 查询书评
* @apiDescription 赵晓彤
* @apiGroup Book
* @apiParam {int} bookId  书籍ID
*
* @apiSuccess {int} code 成功: 0, 失败: 1
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: [{
		book_id: '书籍ID',
		user_id: '用户ID',
		content: '书心得内容',
		name: '写心得人姓名',
		url: '头像url',
		create_time: '评论时间'
      }]
*  }
*
* @apiVersion 1.0.0
*/
router.get('/api/user/reviewList', async (ctx) => {

  let _con = ctx.query;
	// let _con = ctx.request.body;
	
	

  try {

  	// await db.query('select a.id, a.book_id,a.user_id, a.content,a.create_time,a.update_time,b.name,b.url from review_books a,users b where a.book_id='+_con.bookId+' and a.user_id=b.id order by a.create_time desc')
  	//   .spread(result => {
  	// 	ctx.response.status = 200;
	  //   ctx.response.body = {
		//   code: 1,
		//   msg: '请求成功',
		//   data: result
		// }
		// })
		let data = ctx.query;

		if (!data.bookId ||  data.bookId == '') {
			parameterErr(ctx, '书id参数不能为空');
			return;
		}

		let selectResult = await reviewModel.selectData({
			book_id: data.bookId
		}, [['create_time', 'DESC']]);
		
		if (selectResult) {
			for (let i = 0; i < selectResult.length; i++) {
				let selectName = await userModel.selectData({
					id: selectResult[i].user_id
				});

				let selectCount = await commentModel.selectData({
					review_id: selectResult[i].id
				});

				if (selectName.length == 1 && selectCount) {
					selectResult[i].name = selectName[0].name;
					selectResult[i].url = selectName[0].url;
					selectResult[i].count = selectCount.length;
				} else {
					resFailure(ctx, '查询失败');
					return;
				}
			}
			resSuccess(ctx, selectResult);
		} else {
			resFailure(ctx, '查询失败');
		}



  } catch (err) {
  	resFailure(ctx, err);
  }
})

module.exports = router;
