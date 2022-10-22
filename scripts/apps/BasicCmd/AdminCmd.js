import { _ParentClass } from '../_ParentClass/_ParentClass.js';

/**
 * 管理员的游戏控制指令
 */
const BASIC_CMD_PRIOR = 200;
export const adminCmdHandler = [];

export class AdminCmd extends _ParentClass {
  constructor() {
    super({
      name: 'AdminCmd',
      dsc: '管理员的游戏控制指令',
      event: 'message',
      priority: BASIC_CMD_PRIOR,
      rule: [
        {
          reg: '^#*tako召唤开始新游戏',
          fnc: 'takoSummonStartNewGame',
        },
        {
          reg: '^#*tako召唤结束当前游戏',
          fnc: 'takoSummonEndCurrentGame',
        },
        {
          reg: '^#*tako召唤清除历史记录',
          fnc: 'takoSummonClearHistory',
        },
      ],
    });
    // 接收handler函数
    [this.startNewGame, this.endCurrentGame, this.clearHistory] =
      adminCmdHandler;
  }

  /** 0管理员开新局 */
  async takoSummonStartNewGame(e) {
    // 1) 提取需要的数据
    const eData = {
      userId: `${e.user_id}`,
      isMaster: e.isMaster,
    };

    // 2) 交给专门的函数
    const [replyMsg, ...arr] = await this.startNewGame(eData);

    // 3) 收场
    if (arr.length > 0) await this.reply(e, await this.makeForwardMsg(arr));
    return this.reply(e, replyMsg);
  }

  /** 1管理员结束这局 */
  async takoSummonEndCurrentGame(e) {
    // 1) 提取需要的数据
    const eData = {
      userId: `${e.user_id}`,
      isMaster: e.isMaster,
    };

    // 2) 交给专门的函数
    const replyMsg = await this.endCurrentGame(eData);

    // 3) 收场
    return this.reply(e, replyMsg);
  }

  /** 2管理员清记录 */
  async takoSummonClearHistory(e) {
    // 1) 提取需要的数据
    const eData = {
      userId: `${e.user_id}`,
      isMaster: e.isMaster,
    };

    // 2) 交给专门的函数
    const replyMsg = await this.clearHistory(eData);

    // 3) 收场
    return this.reply(e, replyMsg);
  }
}
