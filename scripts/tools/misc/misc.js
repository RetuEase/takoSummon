import { TimeOptions } from '../ObjTpl/Options.js';

export const sleep = async function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const getNowTime = function () {
  return new Intl.DateTimeFormat('zh-CN', new TimeOptions()).format(new Date());
};

/** 时间戳，单位ms */
export const getNowTimeStamp = function () {
  return new Date().getTime();
};

/** 中文全角算两个 */
export const getStrLen = function (str) {
  return Array.from(str).reduce(
    (len, c) => (c.match(/[^\x00-\xff]/gi) != null ? (len += 2) : (len += 1)),
    0
  );
};
