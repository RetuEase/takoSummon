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
    // 1) 获取回复消息对象
    const msgObj = await this.detect();
    if (msgObj) {
      const { informMsg, userId } = msgObj;
      // 2) 群聊私聊分类讨论，消息一条多条也分类讨论
      if (msgObj.isPrivate) {
        return Array.isArray(informMsg)
          ? this.sendPrivate(userId, informMsg.join('\n---------------\n'))
          : this.sendPrivate(userId, informMsg);
      }
      if (msgObj.isGroup) {
        return Array.isArray(informMsg)
          ? this.sendGroup(
              msgObj.groupId,
              informMsg.join('\n---------------\n'),
              userId
            )
          : this.sendGroup(msgObj.groupId, informMsg, userId);
      }
    }
  }
}
