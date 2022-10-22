import plugin from '../../../../lib/plugins/plugin.js';

/**
 * 监听一切不特别的#tk指令
 */
const WATCHMAN_PRIOR = 10000;
export const watchmanHandler = [];

export class TakoWatchman extends plugin {
  constructor() {
    super({
      name: 'TakoWatchman',
      dsc: '常驻监听',
      event: 'message',
      priority: WATCHMAN_PRIOR,
      rule: [
        {
          reg: '^#tk(.*)',
          fnc: 'watchmanAnalyse',
        },
      ],
    });
    // 接收handler函数
    [this.analyse] = watchmanHandler;
  }

  /** 0分析此用户的消息应该给谁处理 */
  async watchmanAnalyse(e) {
    // 1) 提取需要的数据 TODO: 后面东西多了再加
    const eData = {
      userId: `${e.user_id}`,
      userMsg: e.msg, // 读后面的字
    };

    // 2) 交给专门的函数
    const replyMsg = await this.analyse(eData);

    // 3) 收场
    return this.reply(replyMsg);
  }
}
