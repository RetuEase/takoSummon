// Functions
import { noSeeInfo, getGameId } from '../../tools/fileSystem/inspect.js';
import { getRestTime } from '../../tools/misc/misc.js';
// Templates
import { placeInteractCmdHandler } from '../../apps/GameCmd/PlaceInteractCmd.js';
import * as UtModel from '../../models/taskModel/userTaskModel.js';
import * as CurModel from '../../models/gameModel/placeInteractCmdModel.js';
import * as UcModel from '../../models/basicModel/userCmdModel.js';

/**
 * 玩家与地点进行交互的指令
 */

/** 条件判断 */
const condJudge = async function (userId) {
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

/** 0探索某处 */
const exploreBegin = async function (eData) {
  const { userId, userMsg } = eData;
};
placeInteractCmdHandler.push(exploreBegin);
/** 1探索某处 */
const fishBegin = async function (eData) {
  const { userId, userMsg } = eData;
};
placeInteractCmdHandler.push(fishBegin);

/** 1在某处饵钓 */
const gotoBegin = async function (eData) {
  const { userId, userMsg } = eData;

  // 1) 条件判断
  const [condition, gameId] = await condJudge(userId);
  if (!condition) return gameId; // 这里的"gameId"是replyMsg

  // 2) 处理消息
  const midMsg = userMsg.replace(/^#*(tk)?前往/, '').trim();

  // TODO 处理探索/饵钓
  const withEp = midMsg.includes('探索');
  const withFs = midMsg.includes('饵钓');
  if (withEp) {
    const tempArr1 = midMsg.split('探索');
    // 前往探索:推入探索本地
    // 前往A探索B?:推入前往A(若为本地则"已经在A")，然后推入探索B?
  }
  if (withFs) {
    const tempArr1 = midMsg.split('饵钓');
    // 前往饵钓:推入饵钓本地
    // 前往A饵钓B?:推入前往A(若为本地则"已经在A")，然后推入饵钓B?
  }

  const effMsg =
    withEp || withFs ? midMsg.replace(/(探索|饵钓)(*?)/, '').trim() : midMsg;
  if (!effMsg) return '欲往何处？';

  const gotoPlaceId = await CurModel.getPlaceId(effMsg);
  console.log(effMsg);
  if (gotoPlaceId < 0) return `${effMsg}不存在于此世`;

  const curPlace = await CurModel.getCurPlace(userId, gameId);
  if (curPlace == gotoPlaceId) return '原地徘徊...';

  const informMsg = `正在前往${effMsg}...`;
  const params = [curPlace, `${gotoPlaceId}`, false];

  // 3) 构造新任务
  const newTask = {
    ...eData,
    actApp: 'placeInteractCmdCtrler',
    actName: 'gotoEnd',
    informMsg,
    params,
  };

  // 4) 看redis，curUserAct里有没有东西
  const curTask = await redis.get(`takoSummon:${userId}:curUserAct`);
  // NOTE: 去除空对象干扰
  if (curTask && curTask !== '{}') {
    const curUserAct = JSON.parse(curTask);
    const rt = getRestTime(curUserAct.endTime);
    const rtText = rt ? `尚余${rt}完成` : '';

    await UtModel.push(userId, newTask);
    return [
      `当前行动:${curUserAct.informMsg}${rtText}`,
      `新目标：动身前往${effMsg}`,
    ];
  }
  await UtModel.push(userId, newTask);
  const newCurUserAct = JSON.parse(
    await redis.get(`takoSummon:${userId}:curUserAct`)
  );
  const rt = getRestTime(newCurUserAct.endTime);
  const rtText = rt ? `，预计${rt}后完成` : '';
  return `动身前往${effMsg}。${newCurUserAct.informMsg}${rtText}`;
};
placeInteractCmdHandler.push(gotoBegin);
export const calc_gotoEnd = async function (userAct) {
  const gameId = await getGameId();
  if (!gameId) return false;

  const {
    params: [point1, point2],
    userId,
  } = userAct;
  // 所在为半途
  await CurModel.changeCurPlace(userId, gameId, 0);
  userAct.params[2] = true; // 加半途

  return CurModel.calcGotoTime(userId, gameId, point1, point2);
};
export const gotoEnd = async function (curUserAct) {
  const gameId = await getGameId();
  if (!gameId) return false;

  const { params, userId } = curUserAct;
  console.log(`I have been called! ${userId} ${params}`);
  // 所在为终点
  await CurModel.changeCurPlace(userId, gameId, params[1]);
  const informMsg = `已到达${await CurModel.getPlaceName(params[1])}`;
  return {
    ...curUserAct,
    informMsg,
  };
};
