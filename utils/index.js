module.exports = {
  /**
   * 验证有效手机号码
   * @param  {String}  phone [description]
   * @return {Boolean}       [description]
   */
  isValidMobileNo(phone) {
   let _reg = /^1[34578]\d{9}$/;
   return _reg.test(phone);
  },

  /**
   * 匹配中文和英文
   * @param  {String}  str [description]
   * @return {Boolean}       [description]
   */
  isChineseAndEnglish(str) {
   let _reg = /^[\u4e00-\u9fa5_a-zA-Z]+$/;
   return _reg.test(str);
  },

  /**
   * 匹配公司邮箱尾缀
   * @param  {String}  str [description]
   * @return {Boolean}       [description]
   */
  isEmail(str) {
   let _str = str.split('@');

   if (_str.length > 0 && _str[_str.length - 1] == 'frogshealth.com') {
     return true;
   } else {
     return false;
   }
  },
}
