// Functions
import {
  existUser,
  noSeeInfo,
  getGameId,
} from '../../tools/fileSystem/inspect.js';
// Templates
import { userCmdHandler } from '../../apps/BasicCmd/UserCmd.js';
import * as CurModel from '../../models/basicModel/userCmdModel.js';

/**
 * 用户在每轮游戏外的基本指令
 */

/** 0新用户注册账号 */
const register = async function (eData) {
  const { userId, userName } = eData;

  // 1) 条件判断
  if (userId === '80000000') return '匿名我都不知道你是谁';

  if (existUser(userId)) return '这个号注册过了，要重开先销号';

  // 2) 创建用户存储库
  await CurModel.mkUserRepo(userId, userName);

  // 3) 返回消息
  return `注册成功！${userName}`;
};
userCmdHandler.push(register);

/** 1老用户注销账号 */
export const close = async function (eData) {
  const { userId, userMsg } = eData;

  // 1) 条件判断
  const noSee = noSeeInfo(userId);
  if (noSee) return noSee;

  // 2) 条件判断2：发的是#tkyes吗？
  const userInfoObj = await CurModel.getUserInfo(userId);
  if (
    userMsg
      .replace(/^#tk(\+)?/, '')
      .trim()
      .toLowerCase() !== 'yes'
  )
    return `注销中止！${userInfoObj.userName}`;

  // 3) 条件判断特别：如果游戏正在进行，执行这些操作
  const gameId = await getGameId();
  if (gameId) {
    // TODO4) 遍历其余用户文件夹中的外交关系文件，删除相关的合同、条约；

    // 5) 将用户从“本局游戏参与者”中移除并将该用户加入本局黑名单
    CurModel.changeUserInGameList(userId, gameId, 'attendList', 'remove');
    CurModel.changeUserInGameList(userId, gameId, 'blackList', 'add');
  }

  // 4) 移除用户存储库
  const userName1 = await CurModel.rmUserRepo(userId);

  // 5) 返回消息
  return `注销成功！${userName1}`;
};
const closeAsk = async function (eData) {
  const { userId } = eData;

  // 1) 条件判断
  const noSee = noSeeInfo(userId);
  if (noSee) return noSee;

  // 2) 询问，redis发布待完成的任务
  const informMsg = '确认注销吗？请回复#tkyes确认';
  await redis.set(
    `takoSummon:${userId}:curUserOpera`,
    JSON.stringify({
      operaApp: 'UserCmd',
      operaName: 'close',
      informMsg,
    })
  );
  // 3) 返回消息
  return informMsg;
};
userCmdHandler.push(closeAsk);

/** 2查看用户的个人信息，返回个人信息列表 */
const seeInfo = async function (eData) {
  const { userId } = eData;

  // 1) 条件判断
  const noSee = noSeeInfo(userId);
  if (noSee) return noSee;

  // 2) 获取个人信息obj
  const userInfoObj = await CurModel.getUserInfo(userId);

  // 3) 格式化并返回个人信息列表
  return Object.entries(userInfoObj).map(([key, value]) => `${key}: ${value}`);
};
userCmdHandler.push(seeInfo);

/** 3设置用户的用户名 */
export const setName = async function (eData, callback = false) {
  const { userId, userMsg } = eData;

  // 1) 条件判断
  const noSee = noSeeInfo(userId);
  if (noSee) return noSee;

  // 2) 处理消息
  const newName = callback
    ? userMsg.replace(/^#tk(\+)?/, '').trim()
    : userMsg.replace(/^#*(tk)?(\+)?改名/, '').trim();

  // 3) 如果newName为空，redis发布待完成的任务
  if (!newName) {
    const informMsg = '请回复#tk+要改的名字';
    await redis.set(
      `takoSummon:${userId}:curUserOpera`,
      JSON.stringify({
        operaApp: 'UserCmd',
        operaName: 'setName',
        informMsg,
      })
    );
    return informMsg;
  }

  // 4) 否则直接改名
  const userInfoObj = await CurModel.getUserInfo(userId);
  userInfoObj.userName = newName;
  CurModel.setUserInfo(userId, userInfoObj);

  // 5) 返回消息
  return `改名成功！${newName}`;
};
userCmdHandler.push(setName);

/** 4设置用户的宣言 */
export const setDeclaration = async function (eData, callback = false) {
  const { userId, userMsg } = eData;

  // 1) 条件判断
  const noSee = noSeeInfo(userId);
  if (noSee) return noSee;

  // 2) 处理消息
  const newDeclaration = callback
    ? userMsg.replace(/^#tk(\+)?/, '').trim()
    : userMsg.replace(/^#*(tk)?(\+)?设置?宣言/, '').trim();

  // 3) 如果newDeclaration为空，redis发布待完成的任务
  if (!newDeclaration) {
    const informMsg = '请回复#tk+要设置的宣言';
    await redis.set(
      `takoSummon:${userId}:curUserOpera`,
      JSON.stringify({
        operaApp: 'UserCmd',
        operaName: 'setDeclaration',
        informMsg,
      })
    );
    return informMsg;
  }

  // 4) 否则直接设置宣言
  const userInfoObj = await CurModel.getUserInfo(userId);
  userInfoObj.declaration = newDeclaration;
  CurModel.setUserInfo(userId, userInfoObj);

  // 5) 返回消息
  return `设置宣言成功！${newDeclaration}`;
};
userCmdHandler.push(setDeclaration);

/** 5设置用户是否自动加入新游戏 */
const setAutoJoin = async function (eData) {
  const { userId, userMsg } = eData;

  // 1) 条件判断
  const noSee = noSeeInfo(userId);
  if (noSee) return noSee;

  // 2) 处理消息
  const newAutoJoin = userMsg
    .replace(/^#*(tk)?(设置)?自动加?入?新?游戏/, '')
    .trim();

  if (newAutoJoin !== '开' && newAutoJoin !== '关') {
    return '？？你要开还是关？';
  }

  // 3) 设置是否自动加入新游戏
  const userInfoObj = await CurModel.getUserInfo(userId);
  userInfoObj.autoJoinNewGame = newAutoJoin === '开' ? true : false;
  CurModel.setUserInfo(userId, userInfoObj);

  // 4) 返回消息
  return `自动加入新游戏已${newAutoJoin === '开' ? '开启！' : '关闭！'} ${
    userInfoObj.userName
  }`;
};
userCmdHandler.push(setAutoJoin);

/** 6将用户加入当前游戏 */
const joinCurrentGame = async function (eData) {
  const { userId } = eData;

  // 1) 条件判断
  const noSee = noSeeInfo(userId);
  if (noSee) return noSee;

  const gameId = await getGameId();
  if (!gameId) return '都没开始游戏呢加入个锤子';

  // 2) 条件判断2：是否在黑名单或参与者里
  const inBL = CurModel.judgeUserInGameList(userId, gameId, 'blackList');
  const inAL = CurModel.judgeUserInGameList(userId, gameId, 'attendList');
  if (await inBL) return '这里已经没有你的位置了！（你在本局游戏黑名单里）';
  if (await inAL) return '你早就加入游戏了，还加，还加';

  // 3) 将玩家加入本局游戏的attendList、同时创建用户游戏文件夹
  CurModel.changeUserInGameList(userId, gameId, 'attendList', 'add');
  const userName = await CurModel.mkUserGameRepo(userId, gameId);

  // 4) 返回消息
  return `${userName} 已成功加入当前游戏！`;
};
userCmdHandler.push(joinCurrentGame);

/** 7将用户移出当前游戏 */
const exitCurrentGame = async function (eData) {
  const { userId } = eData;

  // 1) 条件判断
  const noSee = noSeeInfo(userId);
  if (noSee) return noSee;

  const gameId = await getGameId();
  if (!gameId) return '已经结束咧！不用退出咧！';

  // 2) 条件判断2：是否在attendList中
  const inAL = await CurModel.judgeUserInGameList(userId, gameId, 'attendList');
  if (!inAL) return e.reply(`还没加入就想着退出?`);

  // TODO3) 遍历其余用户文件夹中的外交关系文件，删除相关的合同、条约；

  // 4) 将用户从“本局游戏参与者”中移除并将该用户加入本局黑名单
  CurModel.changeUserInGameList(userId, gameId, 'attendList', 'remove');
  CurModel.changeUserInGameList(userId, gameId, 'blackList', 'add');

  // 5) 返回消息
  const userInfoObj = await CurModel.getUserInfo(userId);
  return `${userInfoObj.userName} 已成功退出当前游戏！`;
};
userCmdHandler.push(exitCurrentGame);
