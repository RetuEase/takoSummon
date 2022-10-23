import { _ParentClass } from '../_ParentClass/_ParentClass.js';

/**
 * 监控游戏的定时任务
 */

const TTM_PRIOR = 200;
export const timingTaskHandler = [];

export class TimingTask extends _ParentClass {
  constructor() {
    super({
      name: 'TimingTask',
      dsc: '游戏定时任务管理器',
      event: 'message',
      priority: TTM_PRIOR,
      rule: [],
    });
    [this.cron, this.detect] = timingTaskHandler;
    this.task = {
      cron: this.cron,
      name: 'TakoTimingTaskMonitor',
      // 回调函数
      fnc: () => this.detectFirst(),
    };
  }

  async detectFirst() {
    // 1)
    const msgObj = await this.detect();
    if (msgObj) {
      if (msgObj.isPrivate) this.sendPrivate(msgObj.userId, msgObj.informMsg);
      if (msgObj.isGroup)
        this.sendGroup(msgObj.groupId, msgObj.informMsg, msgObj.userId);
    }
  }
}
