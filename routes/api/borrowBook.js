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
  getMonthEndDay,
  getNextStartTime
} = require('../../utils/date');

/**
* @api {get} /api/user/getBorrowBookList 获取借阅情况接口
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
* @apiSampleRequest http://localhost:3000/api/user/getBorrowBookList?id=1
* @apiVersion 1.0.0
*/

router.get('/api/user/getBorrowBookList', async (ctx) => {
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
* @api {get} /api/admin/getBorrowBookList 后台获取借阅情况接口
* @apiDescription 后台获取借阅情况接口 - 史沐卉
* @apiGroup Book
* @apiParam {string} book_name 书名 默认全部
* @apiParam {string} borrow_name 借阅人 默认全部
* @apiParam {int} borrow_state 借阅状态 默认全部
* @apiParam {string} borrow_date 借阅时间 格式: 2018-01-01 默认全部
* @apiParam {int} page_no 页码 默认1
* @apiParam {int} page_size 每页显示条数 默认25
* @apiSuccess {int} code 成功: 0, 失败: 1
* * @apiSuccess {string} msg 请求成功/失败
* * @apiSuccess {json} data 返回内容: status: 0 借阅中, 1 已预约, 2 取消预约, 3 已还书, 4 超时未还, 5 提醒还书
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: [
        {
            "id": 6,
            "user_id": 1,
            "book_id": 1,
            "user_name": "xiaotong",
            "book_name": "无印良品",
            "status": 3,
            "start_time": "2018-07-31T16:00:00.000Z",
            "end_time": "2018-07-29T16:00:00.000Z",
            "create_time": "2018-07-25T16:00:00.000Z",
            "update_time": "2018-07-25T16:00:00.000Z"
        }
    ]
*  }
* @apiSampleRequest http://localhost:3000/api/admin/getBorrowBookList?id=1
* @apiVersion 1.0.0
*/

router.get('/api/admin/getBorrowBookList', async (ctx) => {
  try {
    const data = ctx.request.query;
    let obj = {};
    let page_no = 1;
    let page_size = 25;

    if (data.page_no && parseInt(data.page_no)) {
      page_no = parseInt(data.page_no);
    }

    if (data.page_size && parseInt(data.page_size)) {
      page_size = parseInt(data.page_size);
    }

    // 根据书名筛选
    if (data.book_name) {
      obj.book_name = {
        $like: '%' + data.book_name + '%',
      };
    }

    // 根据书名筛选
    if (data.user_name) {
      obj.user_name = {
        $like: '%' + data.user_name + '%',
      };
    }

    let date = new Date();
    let startTime;
    let endTime;

    // 根据状态筛选
    switch (parseInt(data.borrow_state)) {
      case 0:
        startTime = getMonthStartDay(date);
        endTime = getNextStartTime(date);
        obj.status = 0;
        obj.start_time = {
          [Op.lt]: endTime,
          [Op.gte]: startTime
        };
        break;
      case 1:
        startTime = getNextStartTime(date);
        endTime = getSixStartTime(date);
        obj.status = 0;
        obj.start_time = {
          [Op.lte]: endTime,
          [Op.gte]: startTime
        };
        break;
      case 2:
        startTime = getNextStartTime(date);
        endTime = getSixStartTime(date);
        obj.status = 2;
        obj.start_time = {
          [Op.lte]: endTime,
          [Op.gte]: startTime
        };
        break;
      case 3:
        startTime = getMonthStartDay(date);
        endTime = getNextStartTime(date);
        obj.status = 1;
        obj.start_time = {
          [Op.lt]: endTime,
          [Op.gte]: startTime
        };
        break;
      case 4:
        startTime = getMonthStartDay(date);
        endTime = getNextStartTime(date);
        obj.status = 0;
        obj.start_time = {
          [Op.lt]: startTime
        };
        break;
      case 5:
        // 同case=0的条件, 提醒由前台展示判断即可, 因为借阅中和提醒还书只能出现一个
        startTime = getMonthStartDay(date);
        endTime = getNextStartTime(date);
        obj.status = 0;
        obj.start_time = {
          [Op.lt]: endTime,
          [Op.gte]: startTime
        };
        break;
      default:
        break;
    }

    // 根据时间筛选
    if (data.borrow_date) {
      let selectDate = new Date(data.borrow_date);
      obj.start_time = {
        [Op.lt]: getNextStartTime(selectDate),
        [Op.gte]: getMonthStartDay(selectDate)
      };
    }

    let selectResult = await borrowModel.selectPageData(obj, [
      ['start_time', 'DESC']
    ], page_size, (page_no - 1) * page_size);

    // 循环处理借阅列表状态值, status: 0 借阅中, 1 已预约, 2 取消预约, 3 已还书, 4 超时未还, 5 提醒还书
    if (selectResult) {
      let returnObj = selectResult;
      returnObj.page_size = page_size;
      returnObj.page_no = page_no;

      for (let i = 0; i < returnObj.rows.length; i++) {
        switch (returnObj.rows[i].status) {
          case 0:
            if (new Date(returnObj.rows[i].start_time) -
              getMonthStartDay(date) == 0) {
              if (getMonthEndDay(date).getDay() == date.getDay()) {
                returnObj.rows[i].status = 5;
              } else {
                returnObj.rows[i].status = 0;
              }
            } else if (new Date(returnObj.rows[i].start_time) -
              getMonthStartDay(date) < 0) {
              returnObj.rows[i].status = 4;
            } else {
              returnObj.rows[i].status = 1;
            }
            break;
          case 1:
            returnObj.rows[i].status = 3;
            break;
          case 2:
            returnObj.rows[i].status = 2;
            break;
          default:
            break;
        }
        if (returnObj.rows[i].status == 0) {
          if (new Date(returnObj.rows[i].start_time) -
            getMonthStartDay(date) == 0) {
            returnObj.rows[i].status = 0;
          } else if (new Date(returnObj.rows[i].start_time) -
            getMonthStartDay(date) < 0) {
            returnObj.rows[i].status = 4;
          } else {
            returnObj.rows[i].status = 1;
          }
        }
      }

      resSuccess(ctx, returnObj);
    } else {
      resFailure(ctx, '查询失败');
    }
  } catch (err) {
    resFailure(ctx, err);
  }
});

/**
* @api {post} /api/user/borrowBook 借书/预约接口
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
* @apiSampleRequest http://localhost:3000/api/user/borrowBook
* @apiVersion 1.0.0
*/

router.post('/api/user/borrowBook', async (ctx) => {
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
      let selectBook = await booksModel.selectData({
        id: data.book_id
      });

      let selectUser = await usersModel.selectData({
        id: userId
      });

      let borrowResult = await borrowModel.insertData({
        book_id: data.book_id,
        book_name: selectBook.title,
        user_id: userId,
        user_name: selectUser.name,
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
* @api {post} /api/user/cancelBorrow 取消预约接口
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
* @apiSampleRequest http://localhost:3000/api/user/cancelBorrow
* @apiVersion 1.0.0
*/

router.post('/api/user/cancelBorrow', async (ctx) => {
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
* @api {GET} /api/userInfo?userId=3 用户借阅书籍信息接口
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
  try {
    const userId = ctx.user.id;

    if (!userId) {
      parameterErr(ctx, {});
      return;
    }

    let sql = 'select a.type_id,a.title,a.author,a.url,a.content,' +
    'a.create_time,a.update_time,a.status as bookStatus,b.book_id,' +
    'b.status,b.start_time,b.end_time from books a,borrow_books b where' +
    ' b.user_id=' + userId + ' and a.id=b.book_id order by a.create_time desc';

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

router.get('/api/getUserBorrowBooks', getUserBorrowBooks);

module.exports = router;
