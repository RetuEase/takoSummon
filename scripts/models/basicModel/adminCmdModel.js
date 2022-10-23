// Functions
import { readYaml, writeYaml } from '../../tools/fileSystem/rwYaml.js';
import { mkdir, rm, readFolderSync } from '../../tools/fileSystem/mrDir.js';
import { getNowTime } from '../../tools/misc/misc.js';
// Templates
import { GameInfo } from '../../tools/ObjTpl/GameData.js';
import { GhObj } from '../../tools/ObjTpl/Logs.js';
import FNAME from '../../tools/fileSystem/__FILE_NAME.js';
import Config from '../../tools/fileSystem/config.js';

/**
 * 管理员的游戏控制指令
 */

/**
 * 告诉gameHistory.yaml有一个新局
 * @returns gameId和startTime
 */
const newGH = async function () {
  // 1) 获取服务器当前时间
  const nowTime = getNowTime();

  // 2) 读取当前版本和历史游戏id，获取当前的版本和id
  const verObj = await Config.getConfig('version', 'version');
  const { currentVersion: curVer } = verObj;
  const ghList = await readYaml('log', `${FNAME.gameHistory}`);

  const lastGhObj = ghList.at && ghList.at(-1); // 如果没读到就没有这个方法了
  const lastId = lastGhObj?.id;
  const lastVer = lastGhObj?.version;
  const curId = lastVer === curVer ? lastId + 1 : 1;

  // 3) 将新ghObj推入ghList并写回去
  ghList.push(new GhObj(curVer, curId, nowTime));
  writeYaml('log', `${FNAME.gameHistory}`, ghList);

  // 4) 格式化并返回gameId，返回startTime
  return [[curVer, curId].join('_'), nowTime];
};

/**
 * 告诉gameHistory.yaml这局游戏结束了
 * @returns endTime
 */
const endGH = async function () {
  // 1) 获取服务器当前时间
  const nowTime = getNowTime();

  // 2) 读取历史游戏记录，获取并弹出当前的ghObj
  const ghList = await readYaml('log', `${FNAME.gameHistory}`);
  const curGhObj = ghList.pop && ghList.pop(); // 如果没读到就没有这个方法了
  if (!curGhObj) return nowTime;

  // 3) 修改endTime并重新推入detail并写回去yaml
  curGhObj.endTime = nowTime;
  ghList.push(curGhObj);
  writeYaml('log', `${FNAME.gameHistory}`, ghList);

  return nowTime;
};

/**
 * 创建单局游戏文件夹和各项初始文件
 * @return gameId
 */
export const mkGameRepo = async function () {
  // 1) 告诉gh.yaml有一个新局，并获取gameId和startTime
  const [gameId, startTime] = await newGH();

  // 2) 创建新游戏文件夹与相关初始文件
  await mkdir('gameData', gameId);
  await Promise.all([
    writeYaml(
      'gameData',
      `${gameId}/${FNAME._gameInfo}`,
      new GameInfo(startTime)
    ),
    writeYaml('gameData', `${gameId}/${FNAME.blackList}`, []),
    writeYaml('gameData', `${gameId}/${FNAME.attendList}`, []),

    // 创建log备忘录
    writeYaml('log', `${FNAME.gameMark}`, { gameId }),

    mkdir('gameData', `${gameId}/${FNAME.miliAlli}`),
    mkdir('gameData', `${gameId}/${FNAME.unitNatn}`),
    mkdir('gameData', `${gameId}/${FNAME.busiAlli}`),
    mkdir('gameData', `${gameId}/${FNAME.contracts}`),
  ]);

  return gameId;
};

/**
 * 标记这个游戏文件夹为已结束
 * @param gameId 本局游戏id（和gameHistory弱绑定确保稳定删除）
 */
export const shutGameRepo = async function (gameId) {
  // 1) 更新gameHistory，返回endTime
  // NOTE: 其实有点担心gameHistory和实际gameId弱绑定会出问题
  const endTime = await endGH();

  // 2) 更新对应gameId游戏文件夹内 本局游戏信息文件的 游戏结束时间
  const gameInfoObj = await readYaml(
    'gameData',
    `${gameId}/${FNAME._gameInfo}`
  );
  gameInfoObj.gameEndTime = endTime;
  writeYaml('gameData', `${gameId}/${FNAME._gameInfo}`, gameInfoObj);

  // 3) 删除log备忘录
  rm('log', `${FNAME.gameMark}.yaml`);

  return;
};

/**
 * 获取自动加入新游戏为true的用户列表
 * @returns 自动加入新游戏为true的用户列表
 */
export const getAutoJoinUsers = async function () {
  // 1) 遍历用户数据文件夹，参考index.js并列读取autoJoinNewGame
  const userInfoProms = readFolderSync('userData').map(uId =>
    readYaml('userData', `${uId}/${FNAME._userInfo}`)
  );
  const userInfoLoads = await Promise.allSettled(userInfoProms);
  const ajUsers = [];

  // 2) 如果read成功了而且value里的aJNG是true，则加入列表
  userInfoLoads.forEach(({ status, value: uiObj }) => {
    if (status !== 'fulfilled') return;
    if (uiObj.autoJoinNewGame) ajUsers.push(uiObj.userId);
  });

  // 3) 返回这个列表
  return ajUsers;
};

/**
 * 清除游戏记录
 * @returns Promise，删完了fulfilled
 */
export const clearGameHistory = async function () {
  // 1) 遍历游戏数据文件夹，删除之
  const clearGProms = readFolderSync('gameData').map(gId =>
    rm('gameData', `${gId}`)
  );

  // 2) 遍历用户数据文件夹，删除其中的游戏文件夹
  const clearUProms = readFolderSync('userData').flatMap(uId =>
    readFolderSync('userData', `${uId}`).map(gId =>
      rm('userData', `${uId}/${gId}`)
    )
  );

  // 3) 写入一个空数组的gameHistory覆盖之
  writeYaml('log', `${FNAME.gameHistory}`, []);

  // 4) 返回删除的Promise
  return Promise.all([...clearGProms, ...clearUProms]);
};
