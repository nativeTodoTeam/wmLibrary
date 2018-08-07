const router = require('koa-router')();
const bookModel = require('../../models/books');
const {resSuccess, resFailure} = require('../../public/js/route');

/**
* @api {get} /test?id=0 test
* @apiDescription 测试get接口
* @apiGroup Book
* @apiParam {int} id 书id
* @apiSuccess {int} code 成功: 0, 失败: 1
* * @apiSuccess {string} msg 请求成功/失败
* * @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: []
*  }
* @apiSampleRequest http://localhost:3000/test_post
* @apiVersion 1.0.0
*/
router.get('/test', async (ctx) => {
  try {
    // await bookModel.insertData({
    //   title: '测试书籍',
    // })
    // .then(result => {
    //   console.log(result);
    // })
    // await bookModel.selectData({
    //   title: '测试书籍'
    // })
    // .then(result => {
    //   console.log(result);
    // })

    await bookModel.updateData({
      title: '测试书籍'
    }, {
      title: '测试书籍1'
    }).then(result => {
      console.log(result);
    });

    // await bookModel.deleteData({
    //   id: 32
    // })
    // .then(result => {
    //   console.log(result);
    // })
    resSuccess(ctx, {});
    // await ctx.render('index');
  } catch (err) {
    resFailure(ctx, err);
  }
});

/**
* @api {post} /test_post test_post
* @apiDescription 测试post接口
* @apiGroup Book
* @apiParam {string} title 书名
* @apiSuccess {int} code 成功: 0, 失败: 1
* * @apiSuccess {string} msg 请求成功/失败
* * @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 0,
      msg: '请求成功',
      data: []
*  }
* @apiSampleRequest http://localhost:3000/test_post
* @apiVersion 1.0.0
*/

router.get('/test_post', async (ctx) => {
  console.log(ctx.request.body);
  try {
    const book = ctx.request.body;
    await bookModel.insertData({
      title: book.title,
    }).then(result => {
      console.log(result);
    });
    resSuccess(ctx, {});
  } catch (err) {
    resFailure(ctx, err);
  }
});

module.exports = router;
