const router = require('koa-router')();
const borrowModel = require('../../models/borrow_books');
const booksModel = require('../../models/books');
const usersModel = require('../../models/user');
const Sequelize = require('sequelize');
const db = require('../../config/db').sequelize;
const Op = Sequelize.Op;
const {resSuccess, resFailure, parameterErr} = require('../../public/js/route');
const {
  getSixStartTime,
  getMonthStartDay,
  getMonthEndDay
} = require('../../utils/date');

/**
* @api {get} /api/getBorrowBookList 获取借阅情况接口
* @apiDescription 获取借阅情况接口 - 史沐卉
* @apiGroup Book
* @apiParam {int} id 书id
* @apiSuccess {int} code 成功: 0, 失败: 1
* * @apiSuccess {string} msg 请求成功/失败
* * @apiSuccess {json} data 返回内容: status: 0 已预约/借出, -1 可预约和借阅
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: [
        {
            "start_time": "2018-07-31T16:00:00.000Z",
            "end_time": "2018-07-29T16:00:00.000Z",
            "create_time": "2018-07-27T02:02:56.000Z",
            "update_time": "2018-07-27T02:02:56.000Z",
            "book_id": 1,
            "user_id": 1,
            "status": 0,
            "id": 1
        }
    ]
*  }
* @apiSampleRequest http://localhost:3000/api/getBorrowBookList?id=1
* @apiVersion 1.0.0
*/

router.get('/api/getBorrowBookList', async (ctx) => {
  try {
    const data = ctx.request.query;

    if (!data.id || data.id == '') {
      parameterErr(ctx, '书id参数不能为空');
      return;
    }

    let date = new Date();
    let startTime = getMonthStartDay(date);
    let endTime = getSixStartTime(date);

    let selectResult = await borrowModel.selectData({
      book_id: data.id,
      status: 0,
      start_time: {
        [Op.lte]: endTime,
        [Op.gte]: startTime
      }
    }, [
      ['start_time', 'ASC']
    ]);

    // 循环处理半年内的借阅问题
    if (selectResult && selectResult.length < 7) {

      if (selectResult.length == 6) {
        resSuccess(ctx, selectResult);
      } else {
        var returnArr = [];
        for (let i = 0; i < 6; i++) {

          let y = startTime.getFullYear();
          let m = startTime.getMonth() + i;

          if (m > 11) {
            y = y + 1;
            m = m - 12;
          }

          let date = new Date(y, m, 1);
          let searchDate = getMonthStartDay(date);

          returnArr.push({
            book_id: data.id,
            status: -1,
            borrow_time:
              searchDate.getFullYear() + '-' + (searchDate.getMonth() + 1),
          });

          for (let j = 0; j < selectResult.length; j++) {

            if (new Date(selectResult[j].start_time) - searchDate == 0) {

              returnArr[i].status = 0;
              break;
            }
          }
        }
      }
      resSuccess(ctx, returnArr);
    } else {
      resFailure(ctx, '查询失败');
    }
  } catch (err) {
    resFailure(ctx, err);
  }
});

/**
* @api {post} /api/borrowBook 借书/预约接口
* @apiDescription 借书/预约接口 - 史沐卉
* @apiGroup Book
* @apiParam {int} book_id 书id
* @apiParam {string} borrow_time 借阅/预约时间 格式: 2018-10
* @apiSuccess {int} code 成功: 0, 失败: 1
* * @apiSuccess {string} msg 请求成功/失败
* * @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: ''
*  }
* @apiSampleRequest http://localhost:3000/api/borrowBook
* @apiVersion 1.0.0
*/

router.post('/api/borrowBook', async (ctx) => {
  try {
    const data = ctx.request.body;
    const userId = ctx.user.id;

    if (!data.book_id || data.book_id == '') {
      parameterErr(ctx, '书id参数不能为空');
      return;
    }

    if (!data.borrow_time || data.borrow_time == '') {
      parameterErr(ctx, 'borrow_time参数不能为空');
      return;
    }

    let borrowDate = new Date(data.borrow_time);
    let startDate = getMonthStartDay(borrowDate);
    let endDate = getMonthEndDay(borrowDate);

    let sixMonthDate = getSixStartTime(new Date());
    if (startDate > sixMonthDate) {
      parameterErr(ctx, '开始时间大于6个月');
      return;
    }

    let nowMonthStartDate = getMonthStartDay(new Date());
    if (startDate < nowMonthStartDate) {
      parameterErr(ctx, '开始时间小于当前时间');
      return;
    }

    let nowDate = new Date();
    let get25date = new Date(
      nowDate.getFullYear(), nowDate.getMonth(), 25, 0, 0, 0);
    if (startDate - nowMonthStartDate == 0 && nowDate > get25date) {
      parameterErr(ctx, '每月25日之后不可借书');
      return;
    }

    let selectResult = await borrowModel.selectData({
      [Op.or]: [{book_id: data.book_id}, {user_id: userId}],
      status: 0,
      start_time: {
        [Op.lte]: startDate,
        [Op.gte]: startDate
      }
    });

    if (selectResult.length > 0) {
      resFailure(ctx, '当前时间不可预约');
    } else {
      let borrowResult = await borrowModel.insertData({
        book_id: data.book_id,
        user_id: userId,
        start_time: startDate,
        end_time: endDate,
        status: 0
      });

      if (borrowResult) {
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
* @api {post} /api/cancelBorrow 取消预约接口
* @apiDescription 取消预约接口 - 史沐卉
* @apiGroup Book
* @apiParam {int} borrow_id 预约id
* @apiSuccess {int} code 成功: 0, 失败: 1
* * @apiSuccess {string} msg 请求成功/失败
* * @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: ''
*  }
* @apiSampleRequest http://localhost:3000/api/cancelBorrow
* @apiVersion 1.0.0
*/

router.post('/api/cancelBorrow', async (ctx) => {
  try {
    const data = ctx.request.body;
    const userId = ctx.user.id;

    if (!data.borrow_id || data.borrow_id == '') {
      parameterErr(ctx, '预约id参数不能为空');
      return;
    }

    let selectResult = await borrowModel.selectData({
      id: data.borrow_id,
      user_id: userId,
      status: 0
    });

    if (selectResult.length > 0) {
      let cancelResult = await borrowModel.updateData({
        status: 2
      }, {
        id: data.borrow_id
      });

      if (cancelResult == 1) {
        resSuccess(ctx, '操作成功');
      } else {
        resFailure(ctx, '操作失败');
      }
    } else {
      resFailure(ctx, '操作失败');
    }
  } catch (err) {
    resFailure(ctx, err);
  }
});

/**
* @api {GET} /userInfo?userId=3 用户借阅书籍信息接口
* @apiGroup Book
* @apiDescription Author:汪小岗
* @apiParam {Number} userId 用户id (必填)
*
* @apiSuccess {Number} code 成功: 1, 失败: 0, 参数错误: 2
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {string} data 返回数据
* @apiSuccessExample {Array} Success-Response:
* {
    code: 1,
    msg: '请求成功',
    data: [
      {
        "type_id": 1,
        "title": "PHP核心技术与最佳实践",
        "author": "列旭松、陈文",
        "url": null,
        "content": "这是一个PHP实践的介绍呀",
        "create_time": "2018-07-24T06:09:56.000Z",
        "update_time": "2018-07-24T06:09:56.000Z",
        "bookStatus": null,
        "book_id": 1,
        "status": 1,
        "start_time": "2018-10-31T16:00:00.000Z",
        "end_time": "2018-11-29T16:00:00.000Z"
      }
    ]
* }
* @apiVersion 1.0.0
*/
const getUserBorrowBooks = async (ctx) => {
  let data = ctx.request.query;

  if (!data.userId) {
    parameterErr(ctx, {});
    return;
  }

  let sql = 'select a.type_id,a.title,a.author,a.url,a.content,a.create_time,'+
    'a.update_time,a.status as bookStatus,b.book_id,b.status,b.start_time,' +
    'b.end_time from books a,borrow_books b where b.user_id=' + data.userId +
    ' and a.id=b.book_id order by a.create_time desc';

  try {

    await db.query(sql)
      .spread(result => {
        console.log(result)
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

router.get('/getUserBorrowBooks', getUserBorrowBooks);

module.exports = router;
