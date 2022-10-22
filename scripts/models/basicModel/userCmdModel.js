// Functions
import { readYaml, writeYaml } from '../../tools/fileSystem/rwYaml.js';
import { mkdir, rm } from '../../tools/fileSystem/mrDir.js';
import { getNowTime } from '../../tools/misc/misc.js';
// Templates
import {
  UserInfo,
  PlayerState,
  Diplomacy,
  ActionLog,
  ProcessList,
  PoolList,
  StoreList,
} from '../../tools/ObjTpl/UserData.js';
import FNAME from '../../tools/fileSystem/__FILE_NAME.js';

/**
 * 用户在每轮游戏外的基本指令
 */

/**
 * 创建用户存储库
 */
export const mkUserRepo = async function (userId, userName) {
  // 1) 用户个人信息模板
  const userInfoObj = new UserInfo(userId, userName);

  // 2) 新建文件夹和个人信息文件
  await mkdir('userData', userId);
  await writeYaml('userData', `${userId}/${FNAME._userInfo}`, userInfoObj);

  return;
};

/**
 * 移除用户存储库
 * @returns 用户名
 */
export const rmUserRepo = async function (userId) {
  // 1) 读取用户名
  const userInfoObj = await readYaml(
    'userData',
    `${userId}/${FNAME._userInfo}`
  );
  const userName = userInfoObj.userName;

  // 2) 删除文件夹
  rm('userData', userId);

  // 3) 返回用户名(打印)
  return userName;
};

/**
 * 读取用户个人信息
 * @param userId 用户QQ号
 * @returns 该用户的个人信息object
 */
export const getUserInfo = async function (userId) {
  return readYaml('userData', `${userId}/${FNAME._userInfo}`);
};

/**
 * 重写用户个人信息
 * @param userId 用户QQ号
 * @param userInfoObj 新个人信息object
 */
export const setUserInfo = async function (userId, userInfoObj) {
  writeYaml('userData', `${userId}/${FNAME._userInfo}`, userInfoObj);

  return;
};

//////////////////////////////////////////////////////////

/**
 * 用户在某局游戏文件夹的这个列表里吗
 * @param listName 'blackList'
 * @returns {Promise<Boolean>}
 */
export const judgeUserInGameList = async function (userId, gameId, listName) {
  // 1) 读取列表
  const gameList = await readYaml('gameData', `${gameId}/${FNAME[listName]}`);

  // 2) 返回TA在里面吗？
  return gameList.includes && gameList.includes(userId);
};

/**
 * 将用户从某局游戏文件夹的这个列表里添加/删除
 * @param listName 'attendList'
 * @param mode 'add'/'remove'
 * @param usersId 可以一下子加减一堆
 */
export const changeUserInGameList = async function (
  userId,
  gameId,
  listName,
  mode,
  ...usersId
) {
  if (userId) usersId.unshift(userId);

  // 1) 读取列表
  const gameList = await readYaml('gameData', `${gameId}/${FNAME[listName]}`);
  if (!Array.isArray(gameList)) return;

  // 2) 将TA加进去，或找出来删掉，并写回去
  if (mode === 'add') gameList.push(...usersId);
  if (mode === 'remove') {
    const index = gameList.findIndex(_userId => usersId?.includes(_userId));
    if (index) gameList.splice(index, 1);
  }
  writeYaml('gameData', `${gameId}/${FNAME[listName]}`, gameList);

  return;
};

/**
 * 创建用户游戏文件夹
 * @returns 用户名
 */
export const mkUserGameRepo = async function (userId, gameId) {
  // 1) 获取服务器当前时间
  const nowTime = getNowTime();

  // 2) 修改此用户个人信息的 参与游戏场数 和 上次参与游戏日期
  const userInfoObj = await getUserInfo(userId);
  userInfoObj.participatedGameCount++;
  userInfoObj.lastGameTime = nowTime;
  setUserInfo(userId, userInfoObj);

  // 3) 创建用户的游戏文件夹及其内的初始文件
  await mkdir('userData', `${userId}/${gameId}`);
  await Promise.all([
    writeYaml('userData', `${userId}/${gameId}/${FNAME.taskList}`, []),
    writeYaml(
      'userData',
      `${userId}/${gameId}/${FNAME.playerState}`,
      new PlayerState()
    ),
    writeYaml(
      'userData',
      `${userId}/${gameId}/${FNAME.diplomacy}`,
      new Diplomacy()
    ),
    writeYaml(
      'userData',
      `${userId}/${gameId}/${FNAME.actionLog}`,
      new ActionLog()
    ),
    writeYaml(
      'userData',
      `${userId}/${gameId}/${FNAME.processList}`,
      new ProcessList()
    ),
    writeYaml('userData', `${userId}/${gameId}/${FNAME.pool}`, new PoolList()),
    writeYaml(
      'userData',
      `${userId}/${gameId}/${FNAME.store}`,
      new StoreList()
    ),
    writeYaml('userData', `${userId}/${gameId}/${FNAME.last10Act}`, []),
    writeYaml('userData', `${userId}/${gameId}/${FNAME.last10Eat}`, []),
    writeYaml('userData', `${userId}/${gameId}/${FNAME.last10Use}`, []),
    writeYaml('userData', `${userId}/${gameId}/${FNAME.last10Tako}`, []),
  ]);

  // 4) 返回用户名（打印）
  return userInfoObj.userName;
};
