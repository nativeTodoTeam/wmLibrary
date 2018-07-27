const router = require('koa-router')();
const borrowModel = require('../../models/borrow_books');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const {resSuccess, resFailure, parameterErr} = require('../../public/js/route');
const {
  getSixStartTime,
  getMonthStartDay,
  getMonthEndDay
} = require('../../utils/date');

/**
* @api {get} /getBorrowBookList 获取借阅情况接口
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
* @apiSampleRequest http://localhost:3000/getBorrowBookList?id=1
* @apiVersion 1.0.0
*/

router.get('/getBorrowBookList', async (ctx) => {
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
            id: null,
            book_id: data.id,
            user_id: null,
            status: -1,
            borrow_time:
              searchDate.getFullYear() + '-' + (searchDate.getMonth() + 1),
            start_time: '',
            end_time: '',
            create_time: '',
            update_time: ''
          });

          for (let j = 0; j < selectResult.length; j++) {

            if (new Date(selectResult[j].start_time) - searchDate == 0) {

              Object.assign(returnArr[i], selectResult[j]);
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
* @api {post} /borrowBook 借书/预约接口
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
* @apiSampleRequest http://localhost:3000/borrowBook
* @apiVersion 1.0.0
*/

router.post('/borrowBook', async (ctx) => {
  try {
    const data = ctx.request.body;

    if (!data.book_id || data.book_id == '') {
      parameterErr(ctx, '书id参数不能为空');
      return;
    }

    // if (!data.user_id || data.user_id == '') {
    //   parameterErr(ctx, '用户id参数不能为空');
    //   return;
    // }

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
      [Op.or]: [{book_id: data.book_id}, {user_id: data.user_id}],
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
        user_id: data.user_id,
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
* @api {post} /cancelBorrow 取消预约接口
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
* @apiSampleRequest http://localhost:3000/cancelBorrow
* @apiVersion 1.0.0
*/

router.post('/cancelBorrow', async (ctx) => {
  try {
    const data = ctx.request.body;

    if (!data.borrow_id || data.borrow_id == '') {
      parameterErr(ctx, '预约id参数不能为空');
      return;
    }

    let selectResult = await borrowModel.selectData({
      id: data.borrow_id,
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

module.exports = router;