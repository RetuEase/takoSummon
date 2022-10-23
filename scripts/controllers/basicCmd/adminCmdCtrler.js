// Functions
import { noSeeInfo, getGameId } from '../../tools/fileSystem/inspect.js';
import { readFolderSync } from '../../tools/fileSystem/mrDir.js';
import TimingTaskModel from '../../models/taskModel/timingTaskModel.js';
// Templates
import { adminCmdHandler } from '../../apps/BasicCmd/AdminCmd.js';
import * as CurModel from '../../models/basicModel/adminCmdModel.js';
import * as UcModel from '../../models/basicModel/userCmdModel.js';

/**
 * 管理员的游戏控制指令
 */

/** 0管理员开新局，返回数组除了第1条做成转发消息 */
const startNewGame = async function (eData) {
  const { userId, isMaster } = eData;

  // 1) 条件判断
  const noSee = noSeeInfo(userId);
  if (noSee) return [noSee];

  if (!isMaster) return ['只有主人才能开始游戏！'];

  if (await getGameId()) return ['游戏已经在进行了，先结束这局再开新局罢！'];

  // 2) 创建单局游戏文件夹和各项初始文件，创建log备忘录
  const gameId = await CurModel.mkGameRepo();

  // 3) 通知redis
  await redis.set('takoSummon:game:Id', gameId);

  // 4) 获取自动加入新游戏为true的用户列表
  const ajUsers = await CurModel.getAutoJoinUsers();

  // 5) 将这些用户加入本局游戏的attendList、同时创建游戏文件夹
  // NOTE: 这里用到userCmd中的函数
  const ajUserLoads = await Promise.allSettled([
    UcModel.changeUserInGameList('', gameId, 'attendList', 'add', ...ajUsers),
    ...ajUsers.map(ajUser => UcModel.mkUserGameRepo(ajUser, gameId)),
  ]);

  // 6) 将mUGP返回的userName格式化并推入返回的消息，然后返回消息
  const replyMsgArray = [`新游戏[${gameId}]已开始！`];
  ajUserLoads.forEach(({ status, value: uName }) => {
    if (status === 'fulfilled' && uName)
      replyMsgArray.push(`${uName} 已成功加入当前游戏！`);
  });
  return replyMsgArray;
};
adminCmdHandler.push(startNewGame);

/** 1管理员结束这局 */
const endCurrentGame = async function (eData) {
  const { userId, isMaster } = eData;

  // 1) 条件判断
  const noSee = noSeeInfo(userId);
  if (noSee) return noSee;

  if (!isMaster) return '只有主人才能结束游戏！';

  const gameId = await getGameId();
  if (!gameId) return '都没有游戏在进行，结束个锤子';

  // 2) 通知redis
  await redis.set('takoSummon:game:Id', '');
  readFolderSync('userData').forEach(
    async userId => await redis.set(`takoSummon:${userId}:curUserAct`, '')
  );
  // TODO: 暴力，不知道能不能改
  // 3) 清空定时任务列表
  TimingTaskModel.clear();

  // 4) 标记这个游戏文件夹为已结束，删除log备忘录并返回消息
  CurModel.shutGameRepo(gameId);
  return `当前游戏[${gameId}]已结束！`;
};
adminCmdHandler.push(endCurrentGame);

/** 2管理员清记录 */
const clearHistory = async function (eData) {
  const { userId, isMaster } = eData;

  // 1) 条件判断
  const noSee = noSeeInfo(userId);
  if (noSee) return noSee;

  if (!isMaster) return '只有主人才能清除记录！';

  const gameId = await getGameId();
  if (gameId) return '游戏进行中，结束后再清除吧！';

  // 2) 清除游戏记录并返回消息
  await CurModel.clearGameHistory();
  return '删光光了...';
};
adminCmdHandler.push(clearHistory);
