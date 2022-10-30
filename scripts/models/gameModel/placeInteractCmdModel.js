// Functions
import { readYaml, writeYaml } from '../../tools/fileSystem/rwYaml.js';
import { getNowTimeStamp } from '../../tools/misc/misc.js';
// Templates
import Config from '../../tools/fileSystem/config.js';
import Graph from '../../tools/misc/graph.js';
import FNAME from '../../tools/fileSystem/__FILE_NAME.js';

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

export const calcGotoTime = async function (userId, gameId, point1, point2) {
  const commuteSpeed = (
    await readYaml('userData', `${userId}/${gameId}/${FNAME.playerState}`)
  ).gainAbility.commuteSpeed.reduce((pre, cur) => pre + cur); // 不提供初始值的reduce索引从1开始
  const nowTime = getNowTimeStamp();
  const endTime =
    nowTime + ((await Graph.getEdgeLen(point1, point2)) / commuteSpeed) * 60000;
  return [nowTime, endTime];
};
