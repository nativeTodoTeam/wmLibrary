const router = require('koa-router')();
const usersModel = require('../../../models/user');
const routerConfig = require('../../../public/js/route');


/**
* @api {get} /api/admin/personnelList 人员列表
* @apiDescription 赵晓彤
* @apiGroup PersonnelManage
* @apiParam {int} pageSize 条数
* @apiParam {int} pageNo 页码

* @apiSuccess {int} code 成功: 0, 失败: 1
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: [
        {
          name: '员工姓名',
          email: '员工邮箱',
          phone: '员工手机号',
          company_Id: '员工分公司ID',
          position: '员工职务',
          status: '员工状态 0: 在职  1: 离职'
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

router.get('/api/admin/personnelList', async(ctx, next) => {
  let _query = ctx.query;

  try {
    await usersModel.Users.findAll({
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

  } catch (err) {
    routerConfig.resFailure(ctx, err);
  }
})

/**
* @api {post} /api/admin/addPersonnel 创建员工
* @apiDescription 赵晓彤
* @apiGroup PersonnelManage
* @apiParam {string} email 员工邮箱

* @apiSuccess {int} code 成功: 0, 失败: 1
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '邮箱添加成功',
      data: {}
*  }
*
* @apiVersion 1.0.0
*/

router.post('/api/admin/addPersonnel', async(ctx, next) => {
  let _con = ctx.request.body;
  console.log(_con, 'add')

  try {
    // 判断邮箱是否为空
    if (!_con.email || _con.email == '') {
      routerConfig.parameterErr(ctx, {});
      return;
    }

    // 判断该邮箱是否存在
    let _isEmail; // 0: 未注册 1: 已注册
    await usersModel.Users.findAll({
      where: {
        email: _con.email
      }
    }).then((res) => {

      if (res.length == 0) {
        console.log(res, '怎么看出来的是否注册了123åå');
        _isEmail = 0;
      } else {
        _isEmail = 1;
        ctx.response.body = {
          code: 2,
          msg: '该邮箱已注册'
        }
      }
    })

    // 邮箱未存在，创建邮箱
    if (_isEmail == 0) {

      await usersModel.Users.create({
        email: _con.email,
        reg_status: 1
      }).then(result => {

        routerConfig.resSuccess(ctx, '邮箱添加成功');
      })
    }

  } catch (err) {
    routerConfig.resFailure(ctx, err);
  }
})

/**
* @api {get} /api/admin/findPersonnelDetail 员工信息详情
* @apiDescription 赵晓彤
* @apiGroup PersonnelManage
* @apiParam {int} user_id 员工id

* @apiSuccess {int} code 成功: 0, 失败: 1
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data: {
        name: 员工姓名,
        email: 员工邮箱,
        phone: 员工手机号,
        url: 员工头像,
        signature: 员工签名,
        company_id: 所属分公司 1: 北分 2: 沈分 3: 广州总部,
        status: 员工状态 0: 在职 1: 离职,
        create_time: null,
        update_time: null,
        position: 员工职务,
        reg_status: 员工是否注册邮箱
      }
*  }
*
* @apiVersion 1.0.0
*/

router.get('/api/admin/findPersonnelDetail', async(ctx) => {
  let _query = ctx.query;
  let _userId = parseInt(_query.user_id);

  try {

    // 通过用户ID，获取用户详情
    await usersModel.Users.findById(_userId).then((res) => {

      let _data = {
        name: res.dataValues.name,
        email: res.dataValues.email,
        phone: res.dataValues.phone,
        url: res.dataValues.url,
        signature: res.dataValues.signature,
        company_id: res.dataValues.company_id,
        status: res.dataValues.status,
        create_time: res.dataValues.create_time,
        update_time: res.dataValues.update_time,
        position: res.dataValues.position,
        reg_status: res.dataValues.reg_status
      }
      routerConfig.resSuccess(ctx, _data);
    })

  } catch (err) {
    routerConfig.resFailure(ctx, err);
  }
})

/**
* @api {post} /api/admin/updatePersonnel 修改员工信息
* @apiDescription 赵晓彤
* @apiGroup PersonnelManage
* @apiParam {int} user_id 员工id
* @apiParam {int} email 员工邮箱 修改再传
* @apiParam {int} status 员工状态 修改再传 0: 在职 1: 离职

* @apiSuccess {int} code 成功: 0, 失败: 1
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
*  {
      code: 1,
      msg: '请求成功',
      data:
*  }
*
* @apiVersion 1.0.0
*/

router.post('/api/admin/updatePersonnel', async(ctx) => {
  let _query = ctx.request.body;

  try {

    //判断邮箱是否为空
    if (_query.email && _query.email == '') {
      routerConfig.parameterErr(ctx, '邮箱不能为空');
    }

    if (_query.email != '' || _query.status != '') {

      await usersModel.Users.update(_query, {
        where: {
          id: _query.user_id
        }
      }).then((res) => {
        routerConfig.resSuccess(ctx, '');
      })
    }

  } catch (err) {
    routerConfig.resFailure(ctx, err);
  }
})


module.exports = router;
