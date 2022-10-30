import { _ParentClass } from '../_ParentClass/_ParentClass.js';

/**
 * 玩家与地点进行交互的指令
 */

const UTM_PRIOR = 200;
export const userTaskHandler = [];

export class UserTask extends _ParentClass {
  constructor() {
    super({
      name: 'UserTask',
      dsc: '玩家直接操作任务列表的指令',
      event: 'message',
      priority: UTM_PRIOR,
      rule: [
        {
          reg: '^#*(tk)?取消(.*)任务(.*)',
          fnc: 'cancelTask',
        },
      ],
    });

    [this.cancel] = userTaskHandler;
  }

  /** 0取消列表中的某个/某些任务 */
  async cancelTask(e) {
    // 1) 提取需要的数据
    const eData = {
      userId: `${e.user_id}`,
      userMsg: e.msg,
    };

    // 2) 交给专门的函数
    const replyMsg = await this.cancel(eData);

    // 3) 收场
    return this.reply(e, replyMsg, true);
  }
}
