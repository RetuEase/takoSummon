import { getGameId } from '../../tools/fileSystem/inspect.js';

import { timingTaskHandler } from '../../apps/Tasks/TimingTask.js';
import TimingTaskMonitor from '../../models/taskModel/timingTaskModel.js';
import * as UaModel from '../../models/taskModel/curUserActModel.js';

timingTaskHandler.push('*/6 * * * * ?'); // 6秒触发一次

const detect = async function () {
  console.log('detecting...');
  // 1) 条件判断
  const gameId = await getGameId();
  if (!gameId) return false;
  const userId = await TimingTaskMonitor.check();
  if (!userId) return false;
  const replyObj = await UaModel.finish(userId);

  return replyObj;
};
timingTaskHandler.push(detect);

/** 最后再init，防止上面的没push进去 */
await UaModel.initTt();
