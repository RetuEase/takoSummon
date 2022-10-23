import { readYaml, writeYaml } from '../../tools/fileSystem/rwYaml.js';
import { getGameId } from '../../tools/fileSystem/inspect.js';
import FNAME from '../../tools/fileSystem/__FILE_NAME.js';
import { change } from './curUserActModel.js';
import Graph from '../../tools/misc/graph.js';

// 声明文件锁（防止另一个人读完还没写入你先写入了，然后他又写入，你写的就没了）
// 因为这里全是读写同一个文件
let lock = Promise.resolve();
let unlock = () => {};

/** 不合礼法，慎用！ */
export const getFirst = async function (userId) {
  const gameId = await getGameId();
  if (!gameId) return;
  await lock;

  const taskList = await readYaml(
    'userData',
    `${userId}/${gameId}/${FNAME.taskList}`
  );

  if (taskList.length > 0) return taskList[0];
  else return false;
};

/** 推入一个新的userTask如taskList，如果需要合并分解要推入commuteSpeed */
export const push = async function (userId, newUt, commuteSpeed = 10) {
  const gameId = await getGameId();
  if (!gameId) return;
  await lock;
  lock = new Promise(resolve => (unlock = resolve));

  // 1) 读取玩家的任务列表
  const taskList = await readYaml(
    'userData',
    `${userId}/${gameId}/${FNAME.taskList}`
  );
  console.log('读到了什么', taskList);

  // 2) 判断是否要合并分解（前往），如果要，最后更新curUserAct
  const isCommute = newUt.informMsg.includes('前往');

  // 3) 合并分解
  if (isCommute && taskList.length > 0) {
    const commuteArr = [newUt];

    for (let i = taskList.length - 1; i >= 0; i--) {
      if (!taskList[i].informMsg.includes('前往')) break;
      commuteArr.unshift(taskList.pop());
    }

    taskList.push(...Graph.getPathArr(commuteSpeed, ...commuteArr));
    console.log('合并分解', commuteArr, taskList);
    change(userId, taskList[0]);
  }
  // 3) 如果空空，也要更新curUserAct，还要拿到返回的sT/eT更新自己
  else if (taskList.length < 1) {
    taskList.push(newUt);
    taskList[0] = await change(userId, taskList[0]); // NOTE
    console.log('空空', taskList);
  }
  // 3) 如果不用合并分解也不空，直接推入
  else {
    taskList.push(newUt);
    console.log('直接', taskList);
  }

  // 4) 推入并写回去
  await writeYaml(
    'userData',
    `${userId}/${gameId}/${FNAME.taskList}`,
    taskList
  );

  unlock();
};

/** 取消taskList中的一个userTask */
export const remove = async function (userId, index, together = true) {
  const gameId = await getGameId();
  if (!gameId) return;
  await lock;
  lock = new Promise(resolve => (unlock = resolve));

  // 1) 读取玩家的任务列表
  const taskList = await readYaml(
    'userData',
    `${userId}/${gameId}/${FNAME.taskList}`
  );
  if (index < 0) index += taskList.length;

  // 2) 判断是否要一并删除（前往<-前往->all），如果要，最后更新curUserAct
  const isCommute = together && taskList[index].informMsg.includes('前往');
  // 如果together为false，即强制不一并删除

  // 3) 一并删除并更新curUserAct
  if (isCommute && taskList.length > 1) {
    let startIndex = 0;
    for (let i = index; i >= 0; i--) {
      if (!taskList[i].informMsg.includes('前往')) {
        startIndex = i + 1;
        break;
      }
    }
    taskList.splice(startIndex);

    change(userId, taskList[0]);
  }
  // 3) 如果删的是第一个，也要更新curUserAct
  else if (index === 0) {
    taskList.splice(index, 1);
    change(userId, taskList[0]);
  }
  // 3) 如果不是前往且删的不是第一个，就直接删除之
  else {
    taskList.splice(index, 1);
  }

  // 4) 推入并写回去
  await writeYaml(
    'userData',
    `${userId}/${gameId}/${FNAME.taskList}`,
    taskList
  );

  unlock();
};
