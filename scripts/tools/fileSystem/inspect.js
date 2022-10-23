import fs from 'node:fs';
import { readYaml } from './rwYaml.js';
import PATH from './__PATH.js';
import FNAME from './__FILE_NAME.js';

/**
 * 是否存在这个号的用户
 * @param userId
 * @returns {Boolean}
 */
export const existUser = function (userId) {
  return fs.existsSync(`${PATH.userData}${userId}`);
};

/**
 * 看不见的话就返回一些东西
 * @param userId
 * @returns 看不见的消息或者看得见''
 */
export const noSeeInfo = function (userId) {
  if (userId === '80000000') return '匿名我都不知道你是谁';

  if (!existUser(userId)) return '都还没注册呢搞什么哦...';

  return '';
};

/**
 * 试图获取当前gameId，没有游戏在进行的话返回''
 * @returns gameId/''
 */
export const getGameId = async function () {
  const gameId = await redis.get('takoSummon:game:Id');
  console.log(1, gameId);
  if (gameId) return gameId;

  console.log(2, gameId);
  if (!fs.existsSync(`${PATH.log}${FNAME.gameMark}.yaml`)) return '';

  const newGameId = (await readYaml('log', `${FNAME.gameMark}`)).gameId;
  await redis.set('takoSummon:game:Id', newGameId);
  console.log(3, newGameId);
  return newGameId;
};

/**
 * 获取某个根目录下的文件夹们的名字(id)
 * @param root 根目录
 * @returns {Array} id
 */
// export const getDataIdsync = function (root) {
//   return fs
//     .readdirSync(PATH[root])
//     .filter(fName => fs.statSync(`${PATH[root]}${fName}`).isDirectory());
// };
