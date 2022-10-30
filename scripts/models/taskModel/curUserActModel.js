/** redis */

import { readFolderSync } from '../../tools/fileSystem/mrDir.js';
import { getGameId } from '../../tools/fileSystem/inspect.js';

import Ctrler from '../../controllers/ctrler.js';

import TimingTaskMonitor from './timingTaskModel.js';
import * as UtModel from './userTaskModel.js';

/** 给userAct添加sT/eT */
const addTime = async function (userAct, actApp, actName) {
  // 调用对应的calc函数来计算任务的开始和结束时间
  const [sT, eT] = await Ctrler[actApp][`calc_${actName}`](userAct);

  return {
    ...userAct,
    startTime: sT,
    endTime: eT,
  };
};

const exeFunc = async function (userAct) {
  const { actApp, actName } = userAct;
  const replyMsgObj = await Ctrler[actApp][actName](userAct);

  return replyMsgObj;
};

/**
 * 修改redis的内容（有->有/有->无/无->有）
 * @param newUserAct 设置为obj，取消为''
 * @returns 若改变成功返回船新ua(含sT/eT)，改变失败或无输入新ua返回undefined
 */
export const change = async function (userId, newUserAct) {
  const gameId = await getGameId();
  if (!gameId) return;

  // 1) 读redis
  const curUserAct = await redis.get(`takoSummon:${userId}:curUserAct`);

  // 2) 如果一开始有，要先取消tt
  if (curUserAct && curUserAct !== '{}') {
    const { endTime } = JSON.parse(curUserAct);
    TimingTaskMonitor.cancel(userId, endTime);

    // 如果新的也有，大概是合并分解的结果（半途），graph已经处理了sT/eT，直接放到redis和TTM即可
    if (newUserAct) {
      const { actApp, actName, params } = newUserAct;
      // 如果是假的，不是真的...那应该是remove（删完还有东西）
      if (!params[2]) newUserAct = await addTime(newUserAct, actApp, actName);

      redis.set(`takoSummon:${userId}:curUserAct`, JSON.stringify(newUserAct));
      TimingTaskMonitor.register(userId, newUserAct.endTime);
    } else {
      redis.set(`takoSummon:${userId}:curUserAct`, '');
    }

    return newUserAct;
  }

  // 3) 如果一开始没有而后面有，那就要调用calc_actName来计算sT/eT了
  if (newUserAct) {
    const { actApp, actName, params } = newUserAct;

    if (params[2]) logger.info(`${userId}成功同步动作，或成功返程！`);
    // 如果是假的，不是真的（有半途标识符）...那就是同步/返程
    else newUserAct = await addTime(newUserAct, actApp, actName);
    // 放到redis和TTM中
    redis.set(`takoSummon:${userId}:curUserAct`, JSON.stringify(newUserAct));
    TimingTaskMonitor.register(userId, newUserAct.endTime);

    return newUserAct;
  }
};

/** redis 有->无 调用UTM的remove 调用对应的执行函数，返回消息obj */
export const finish = async function (userId) {
  const gameId = await getGameId();
  if (!gameId) return;

  // 1) 读redis
  const finishedUserAct = await redis.get(`takoSummon:${userId}:curUserAct`);
  if (!finishedUserAct) return;

  // 2) 调用UTM的remove和清空redis
  await redis.set(`takoSummon:${userId}:curUserAct`, '');
  const extraInformMsg = await UtModel.remove(userId, 0, false);

  // 3) 调用对应的执行函数，修改回复信息
  const userAct = JSON.parse(finishedUserAct);
  const replyMsgObj = await exeFunc(userAct);
  if (extraInformMsg)
    replyMsgObj.informMsg = [replyMsgObj.informMsg, extraInformMsg];
  return replyMsgObj;
};

/** 将redis中的任务同步到TTM，不在的试试从UTM同步 */
export const initTt = async function () {
  const gameId = await getGameId();
  if (!gameId) return;

  // 1) 读redis
  const userIdList = [];
  const redisProms = readFolderSync('userData').map(async userId => {
    userIdList.push(userId);
    return await redis.get(`takoSummon:${userId}:curUserAct`);
  });
  const redisLoads = await Promise.allSettled(redisProms);
  console.log('redisLoads:', redisLoads);

  // 2) 将redis的任务注册到游戏对象的定时任务中
  await Promise.allSettled(
    redisLoads.map(async ({ status, value: userAct = '' }, index) => {
      if (status !== 'fulfilled') return;
      const userId = userIdList[index];
      // NOTE: 去除空对象干扰
      if (userAct && userAct !== '{}') {
        // redis.set(...)
        TimingTaskMonitor.register(userId, JSON.parse(userAct).endTime);
      }
      // 不在的试试从UTM同步
      else {
        const firstUt = await UtModel.getFirst(userId);
        if (firstUt) {
          redis.set(`takoSummon:${userId}:curUserAct`, JSON.stringify(firstUt));
          TimingTaskMonitor.register(userId, firstUt.endTime);
        }
      }
    })
  );
};
