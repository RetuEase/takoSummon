// Functions
import { getRestTime } from '../../tools/misc/misc.js';
// Templates
import { userTaskHandler } from '../../apps/Tasks/UserTask.js';
import * as CurModel from '../../models/taskModel/userTaskModel.js';
import * as PicModel from '../../models/gameModel/placeInteractCmdModel.js';

/** 0取消列表中的某个/某些任务 */
const cancel = async function (eData) {
  const { userId, userMsg } = eData;

  // 1) 条件判断
  const [condition, gameId] = await PicModel.condJudge(userId);
  if (!condition) return gameId; // 这里的"gameId"是replyMsg
  const curTask = await redis.get(`takoSummon:${userId}:curUserAct`);
  if (!curTask || curTask === '{}') return '无事可做，无可取消';

  // 2) 处理消息
  const curUserAct = JSON.parse(curTask);
  // 返程预备（读取当前前往任务的出发点和目标点，反过来）
  const backToParams = curUserAct.informMsg.includes('前往')
    ? [curUserAct.params[1], curUserAct.params[0], false]
    : '';

  // 3) 移除任务
  let cancelName;
  const delCur = userMsg.includes('当前');
  const delLatest = userMsg.includes('最新') || userMsg.includes('最后');
  if (delCur) {
    cancelName = '当前';
    await CurModel.remove(userId, 0);
  }
  if (delLatest) {
    cancelName = '最新';
    await CurModel.remove(userId, -1);
  }
  if (!delCur && !delLatest) {
    // 默认为当前
    cancelName = '当前';
    await CurModel.remove(userId, 0);
  }

  // 4) 看看要不要返程
  const newCurTask = await redis.get(`takoSummon:${userId}:curUserAct`);
  if (backToParams && (!newCurTask || newCurTask === '{}')) {
    // 5) 如果删的是前往，删完又没有别的“前往”任务了(目前这是绝对的)，那就是行至半途，添加返程 NOTE
    await CurModel.push(userId, curUserAct); // 会由graph来算sT/eT，半途为真，所以不用担心会被重新计算
    await CurModel.push(
      userId,
      { ...curUserAct, params: backToParams },
      await PicModel.getCommuteSpeed(userId, gameId)
    ); // 合并分解（注意这里一直是往后走，所以一直取消大概会反复横跳） NOTE

    const newnewCurTask = await redis.get(`takoSummon:${userId}:curUserAct`);
    const rt = getRestTime(JSON.parse(newnewCurTask).endTime);
    const rtText = rt ? `，预计${rt}后完成` : '';
    return `已取消${cancelName}任务，正在返回${await PicModel.getPlaceName(
      curUserAct.params[0]
    )}${rtText}`;
  }
  // 5) 如果不用加返程，直接返回消息
  return `已取消${cancelName}任务`;
};
userTaskHandler.push(cancel);
