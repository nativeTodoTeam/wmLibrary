const moment = require('moment');

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

// 获取月份第一天, 返回格式Date()
const getMonthStartDay = (date) => {
  let year = date.getFullYear();
  let month = date.getMonth();
  let _date = new Date(year, month, 1, 0, 0, 0);
  return new Date(_date);
};

// 获取月份最后一天, 返回格式Date()
const getMonthEndDay = (date) => {
  let _endDay = moment(date).endOf('month').format('YYYY-MM-DD') + ' 23:59:59';
  return new Date(_endDay);
};

// 获取下个月的开始时间, 返回格式Date()
const getNextStartTime = (date) => {
  let startYear = date.getFullYear();
  let startMonth = date.getMonth();
  let endTime = new Date();

  if (startMonth > 11) {
    endTime = new Date(startYear + 1, 1, 1, 0, 0, 0);
  } else {
    endTime = new Date(startYear, startMonth + 1, 1, 0, 0, 0);
  }
  return endTime;
};

module.exports={
  getSixStartTime,
  getMonthCount,
  getMonthStartDay,
  getMonthEndDay,
  getNextStartTime
};