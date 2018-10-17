const router = require('koa-router')();
const {resSuccess, resFailure, parameterErr} = require('../../public/js/route');
const multer = require('koa-multer');//加载koa-multer模块

let date = [
  new Date().getFullYear(),
  new Date().getMonth() + 1,
  new Date().getDate(),
].join('-');

//配置
var storage = multer.diskStorage({
  //文件保存路径
  destination: 'public/images/' + date,
  //修改文件名称
  filename: function (req, file, cb) {
    var fileFormat = (file.originalname).split(".");
    cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);
  }
});
var upload = multer({ storage: storage });


/**
* @api {post} /api/upload/images 图片上传接口(V1.0.0)
* @apiGroup upload
* @apiDescription Author:汪小岗
* @apiParam {form-data} file 文件流
*
* @apiSuccess {Number} code 成功: 1, 失败: 0, 参数错误: 2
* @apiSuccess {string} msg 请求成功/失败
* @apiSuccess {json} data 返回内容
* @apiSuccessExample {json} Success-Response:
* {
    code: 1,
    msg: '上传成功',
    data: {
      url: "/public/images/2018-10-17/1539770900651.png",
    }
* }
* @apiVersion 1.0.0
*/

const uploadImages = async (ctx) => {
  let data = ctx.req.file;

  try {
    if (!data) {
      parameterErr(ctx, {});
      return;
    };

    ctx.response.status = 200;
    ctx.response.body = {
      code: 1,
      msg: '上传成功',
      data: {
        url: '/public/images/' + date + '/' + data.filename,
      }
    }

  } catch (err) {
    resFailure(ctx, err)
  }

}


router.post('/api/upload/images', upload.single('file'), uploadImages);

module.exports = router;
