// Functions
import { readYaml, writeYaml } from '../../tools/fileSystem/rwYaml.js';
import { noSeeInfo, getGameId } from '../../tools/fileSystem/inspect.js';
import { getNowTimeStamp } from '../../tools/misc/misc.js';
// Templates
import Config from '../../tools/fileSystem/config.js';
import Graph from '../../tools/misc/graph.js';
import FNAME from '../../tools/fileSystem/__FILE_NAME.js';
import * as UcModel from '../../models/basicModel/userCmdModel.js';

/** 条件判断 */
export const condJudge = async function (userId) {
  const noSee = noSeeInfo(userId);
  if (noSee) return [false, noSee];

  const gameId = await getGameId();
  if (!gameId) return [false, '都没开始游戏呢'];

  const inGame = await UcModel.judgeUserInGameList(
    userId,
    gameId,
    'attendList'
  );
  if (!inGame) {
    const exitedGame = await UcModel.judgeUserInGameList(
      userId,
      gameId,
      'blackList'
    );

    return [
      false,
      exitedGame ? '你都退出游戏了还想搞什么' : '你都还没加入游戏呢',
    ];
  }

  return [true, gameId];
};

/**
 * @param {String} placeName 地点名
 * @returns {Promise<Number>} placeId，没有则回复-1
 */
export const getPlaceId = async function (placeName) {
  return (await Config.getConfig('gameSet', 'gameMap')).nameMap.findIndex(
    value => value === placeName
  );
};

/**
 * @param {String|Number} placeId 地点编号
 * @returns {Promise<String>} placeName，没有则回复undefined
 */
export const getPlaceName = async function (placeId) {
  return (await Config.getConfig('gameSet', 'gameMap')).nameMap[+placeId];
};

/**
 * @returns {Promise<String>}
 */
export const getCurPlace = async function (userId, gameId) {
  return (
    await readYaml('userData', `${userId}/${gameId}/${FNAME.playerState}`)
  ).locatedIn;
};

export const changeCurPlace = async function (userId, gameId, newPlace) {
  const playerStateObj = await readYaml(
    'userData',
    `${userId}/${gameId}/${FNAME.playerState}`
  );
  playerStateObj.locatedIn = newPlace;
  return writeYaml(
    'userData',
    `${userId}/${gameId}/${FNAME.playerState}`,
    playerStateObj
  );
};

export const getCommuteSpeed = async function (userId, gameId) {
  return (
    await readYaml('userData', `${userId}/${gameId}/${FNAME.playerState}`)
  ).gainAbility.commuteSpeed.reduce((pre, cur) => pre + cur); // 不提供初始值的reduce索引从1开始
};

export const calcGotoTime = async function (userId, gameId, point1, point2) {
  const commuteSpeed = await getCommuteSpeed(userId, gameId);
  const nowTime = getNowTimeStamp();
  const endTime =
    nowTime + ((await Graph.getEdgeLen(point1, point2)) / commuteSpeed) * 60000;
  return [nowTime, endTime];
};
