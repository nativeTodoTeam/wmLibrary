const router = require('koa-router')();
const commentModel = require('../../models/comments');
const {resSuccess, resFailure, parameterErr} = require('../../public/js/route');

/**
* @api {post} /addComment 添加评论
* @apiDescription 赵晓彤
* @apiGroup Book
* @apiParam {int} reviewId  书评ID
* @apiParam {int} userId  用户ID
* @apiParam {string} content 内容
*
* @apiSuccess {int} code 成功: 0, 失败: 1
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: {}
* 
* @apiVersion 1.0.0
*/
router.post('/addComment', async (ctx) => {

  // let _con = ctx.query;
  let _con = ctx.request.body;
  
  try {

  	// 判断参数是否存在和是否为空
  	if (!_con.reviewId || _con.reviewId == '') {
  	  parameterErr(ctx, {});
  	} else if (!_con.userId || _con.userId == '') {
  	  parameterErr(ctx, {});

  	} else if (!_con.content || _con.content == '') {
  	  parameterErr(ctx, {});

    } else {
  
  	  await commentModel.Comment.create({

  	  	review_id: _con.reviewId,
  	  	user_id: _con.userId,
  	  	content: _con.content,

  	  }).then(result => {
  	  	ctx.response.status = 200;
	    ctx.response.body = {
		  code: 1,
		  msg: '请求成功',
		  data: {}
		}
  	  })
    }  	

  } catch (err) {
  	resFailure(ctx, err);
  }
});

module.exports = router;