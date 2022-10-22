// Functions
import { existUser } from '../tools/fileSystem/inspect.js';
// Templates
import { watchmanHandler } from '../apps/TakoWatchman.js';
import * as UserCmd from '../controllers/basicCmd/userCmdCtrler.js';

/** 0分析此用户的消息应该给谁处理 */
const analyse = async function (eData) {
  const { userId } = eData;

  // 1) 条件判断
  if (userId === '80000000') return;
  if (!existUser(userId)) return;

  // 2) 咨询redis这位现在是什么状况，没有就返回，有就读取
  const curUserOpera = await redis.get(`takoSummon:${userId}:curUserOpera`);
  if (!curUserOpera) return;
  // 第一项是类型，第二项是callback函数名，第三项是描述消息
  const { operaApp, operaName } = JSON.parse(curUserOpera);

  // 3) 依名调用（传入盈余的消息即可，注意callback的第二个参数要有）
  let replyMsg;
  switch (operaApp) {
    case 'UserCmd':
      replyMsg = UserCmd[operaName](eData, true);
      break;
  }

  // 4) redis标记完成任务并返回消息
  await redis.set(`takoSummon:${userId}:curUserOpera`, '');
  return replyMsg;
};
watchmanHandler.push(analyse);
