import { TimingTask } from '../../tools/ObjTpl/GameData.js';
import { getNowTimeStamp } from '../../tools/misc/misc.js';

class TimingTaskMonitor {
  #firstFinish;
  #timingTasks = [new TimingTask(false, Number.MAX_SAFE_INTEGER)];

  clear() {
    this.#timingTasks = [new TimingTask(false, Number.MAX_SAFE_INTEGER)];
    this.#firstFinish = this.#timingTasks[0];
  }

  /** 平时回false，有任务完成了回userId */
  check() {
    if (!this.#firstFinish) this.#firstFinish = this.#timingTasks[0];

    const nowTime = getNowTimeStamp();
    console.log('%c TT', 'color:#55d;', this.#firstFinish, this.#timingTasks);

    // 如果到时间了就回userId
    if (nowTime > this.#firstFinish.endTime) {
      this.#firstFinish = this.#timingTasks[1];
      return this.#timingTasks.shift().userId;
    }

    return false;
  }

  register(userId, endTime) {
    // 1) 创建新任务
    const newTtask = new TimingTask(userId, endTime);

    // 2) 找到应有的位置splice入(ttList至少有个无限任务，所以不要怕)
    const myBack = this.#timingTasks.findIndex(tt => tt.endTime > endTime);
    this.#timingTasks.splice(myBack, 0, newTtask);
    console.log('%c Register', 'color:#5d5;', myBack, this.#timingTasks);

    // 3) 更新最先完成的任务
    this.#firstFinish = this.#timingTasks[0];
  }

  cancel(userId, endTime) {
    const canceled = this.#timingTasks.findIndex(
      tt => tt.userId === userId && tt.endTime === endTime
    );
    console.log('%c Cancel', 'color:#d55;', canceled, this.#timingTasks);
    if (canceled > -1) this.#timingTasks.splice(canceled, 1);

    this.#firstFinish = this.#timingTasks[0];
  }
}

export default new TimingTaskMonitor();
