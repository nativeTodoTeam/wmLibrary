const moment = require('moment');

// 日期格式化, 返回格式Date()
const getStartTimeFormat = (date, isFirstDay) => {
  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDate();
  let _date = new Date();
  if (isFirstDay) {
    _date = new Date(year, month, 1, 0, 0, 0);
  } else {
    _date = new Date(year, month, day, 0, 0, 0);
  }
  return _date;
};

// 日期格式化, 返回格式Date()
const getEndTimeFormat = (date) => {
  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDate();
  let _date = new Date();
  _date = new Date(year, month, day, 23, 59, 59);
  return _date;
};

// 获取第6个月的开始时间, 返回格式Date()
const getSixStartTime = (date) => {
  let startYear = date.getFullYear();
  let startMonth = date.getMonth();
  let endTime = new Date();

  if (startMonth > 7) {
    endTime = new Date(startYear + 1, startMonth - 7, 1, 0, 0, 0);
  } else {
    endTime = new Date(startYear, startMonth + 5, 1, 0, 0, 0);
  }
  return endTime;
};

// 获取月份天数
const getMonthCount = (date) => {
  let _endDay = moment(date.getFullYear() +
      '-' + (date.getMonth() + 1), 'YYYY-MM').daysInMonth();
  return _endDay;
};

// 获取月份最后一天, 返回格式YYYY-MM-DD HH:mm:ss
const getMonthEndDay = (date) => {
  let _endDay = moment(date).endOf('month').format('YYYY-MM-DD') + ' 23:59:59';
  return _endDay;
};

module.exports={
  getStartTimeFormat,
  getEndTimeFormat,
  getSixStartTime,
  getMonthCount,
  getMonthEndDay
};