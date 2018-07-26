/*
  日志配置文件
*/
const path = require('path');

//日志根目录
const baseLogPath = path.resolve(__dirname, '../logs');

//错误日志目录
const errorPath = '/error';
//错误日志文件名
const errorFileName = 'error';
//错误日志输出完整路径
const errorLogPath = baseLogPath + errorPath + '/' + errorFileName;

//响应日志目录
const responsePath = '/response';
//响应日志文件名
const responseFileName = 'response';
//响应日志输出完整路径
const responseLogPath = baseLogPath + responsePath + '/' + responseFileName;

module.exports = {
  appenders: {
    //错误日志
    error: {
      category: 'errorLogger', //logger名称
      type: 'file', //日志类型
      filename: errorLogPath, //日志输出位置
      // alwaysIncludePattern: true, //是否总是有后缀名
      // pattern: '-yyyy-MM-dd-hh.log', //后缀，每小时创建一个新的日志文件
      maxLogSize: 104800,
      backups: 10,
      path: errorPath, //自定义属性，错误日志的根目录
    },
    //响应日志
    response: {
      category: 'resLogger',
      type: 'file',
      filename: responseLogPath,
      maxLogSize: 104800,
      backups: 10,
      path: responsePath
    },
    console: {
      category: 'console',
      type: 'console',
    }
  },
  categories: {
    error: {appenders: ['error'], level: 'error'},
    response: {appenders: ['response'], level: 'info'},
    console: { appenders: ['console'], level: 'info' },
    default: { appenders: ['response'], level: 'info' },
  },
  baseLogPath: baseLogPath //logs根目录
};