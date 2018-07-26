const router = require('koa-router')();
const borrowModel = require('../../models/borrow_books');
const Sequelize = require('sequelize');
const moment = require('moment');
const Op = Sequelize.Op;
const {resSuccess, resFailure, parameterErr} = require('../../public/js/route');
const {
  getStartTimeFormat,
  getEndTimeFormat,
  getSixStartTime,
  getMonthCount,
  getMonthEndDay
} = require('../../utils/date');

/**
* @api {get} /getBorrowBookList 获取借阅情况接口
* @apiDescription 获取借阅情况接口 - 史沐卉
* @apiGroup Book
* @apiParam {id} int 书id
* @apiSuccess {int} code 成功: 0, 失败: 1
* * @apiSuccess {string} msg 请求成功/失败
* * @apiSuccess {json} data 返回内容: status: 0 已预约/借出, -1 可预约和借阅
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: [
        {
            "start_time": "2018-07-01 00:00:00",
            "end_time": "2018-07-30 00:00:00",
            "create_time": "2018-07-26 00:00:00",
            "update_time": "2018-07-26 00:00:00",
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
    let startTime = getStartTimeFormat(date, true);
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
        for (let i = 0; i < 6; i++) {

          let y = startTime.getFullYear();
          let m = startTime.getMonth() + i;

          if (m > 11) {
            y = y + 1;
            m = m - 12;
          }

          let date = new Date(y, m, 1);
          let searchDate = getStartTimeFormat(date, true);
          searchDate = moment(searchDate).format('YYYY-MM-DD HH:mm:ss');
          let isHas = false;

          for (let j = 0; j < selectResult.length; j++) {

            if (selectResult[j].start_time == searchDate) {
              isHas = true;
              break;
            }
          }

          if (!isHas) {
            let end_time = getMonthEndDay(searchDate);

            selectResult.push({
              id: null,
              book_id: data.id,
              user_id: null,
              status: -1,
              start_time: searchDate,
              end_time: end_time,
              create_time: '',
              update_time: ''
            });
          }
        }
      }
      resSuccess(ctx, selectResult);
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
* @apiParam {book_id} int 书id
* @apiParam {user_id} int 用户id
* @apiParam {start_time} string 开始时间
* @apiParam {end_time} string 结束时间
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

    if (!data.user_id || data.user_id == '') {
      parameterErr(ctx, '用户id参数不能为空');
      return;
    }

    if (!data.start_time || data.start_time == '') {
      parameterErr(ctx, 'start_time参数不能为空');
      return;
    }

    if (!data.end_time || data.end_time == '') {
      parameterErr(ctx, 'end_time参数不能为空');
      return;
    }

    // 格式化开始时间
    let startDate = new Date(data.start_time);
    startDate = getStartTimeFormat(startDate);

    // 格式化结束时间
    let endDate = new Date(data.end_time);
    endDate = getEndTimeFormat(endDate);

    // 获取月份多少天
    let _endDay = getMonthCount(endDate);

    if (startDate.getDate() != 1) {
      parameterErr(ctx, 'start_time参数错误');
      return;
    }

    if (endDate.getDate() - startDate.getDate() + 1 != _endDay) {
      parameterErr(ctx, 'end_time参数错误');
      return;
    }

    if (startDate > endDate) {
      parameterErr(ctx, '开始时间大于结束时间');
      return;
    }

    let sixMonthDate = getSixStartTime(new Date());
    if (startDate > sixMonthDate) {
      parameterErr(ctx, '开始时间大于6个月');
      return;
    }

    let nowDate = getStartTimeFormat(new Date(), true);
    if (startDate < nowDate) {
      parameterErr(ctx, '开始时间小于当前时间');
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

module.exports = router;