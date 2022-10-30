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

/** 返回一个格式化后的剩余时间 */
export const getRestTime = function (endTime) {
  const restTime = endTime - getNowTimeStamp();
  const hours = Math.trunc(restTime / 360000);
  const minutes = Math.trunc((restTime % 3600000) / 60000);
  const seconds = Math.trunc((restTime % 60000) / 1000);
  return `${hours > 0 ? `${hours}小时` : ''}${
    minutes > 0 ? `${minutes}分` : ''
  }${seconds > 0 ? `${seconds}秒` : ''}`;
};

/** 中文全角算两个 */
export const getStrLen = function (str) {
  return Array.from(str).reduce(
    (len, c) => (c.match(/[^\x00-\xff]/gi) != null ? (len += 2) : (len += 1)),
    0
  );
};
