const router = require('koa-router')();
const bookModel = require('../models/books');

 // 将views设为模板的情况下, 可以用render
router.get('/', async (ctx, next) => {
  // await bookModel.insertData({
  //   title: '测试书籍',
  // })
  // await bookModel.selectData({
  //   title: '测试书籍'
  // })
  await bookModel.updateData({
    title: '测试书籍1'
  }, {
    where: {
      id: 8
    }
  })
  .then(r => {
    console.log(r);
  })
  .catch(e => {
    console.log(e);
  })
  await ctx.render('index');
});
 
 module.exports = router