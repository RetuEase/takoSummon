import { _ParentClass } from '../_ParentClass/_ParentClass.js';

/**
 * 玩家与地点进行交互的指令
 */

const PIR_CMD_PRIOR = 200;
export const placeInteractCmdHandler = [];

export class PlaceInteractCmd extends _ParentClass {
  constructor() {
    super({
      name: 'PlaceInteractCmd',
      dsc: '玩家与地点进行交互的指令',
      event: 'message',
      priority: PIR_CMD_PRIOR,
      rule: [
        {
          reg: '^#*(tk)?探索(.*)',
          fnc: 'explore',
        },
        {
          reg: '^#*(tk)?饵钓(.*)',
          fnc: 'fish',
        },
        {
          reg: '^#*(tk)?前往(.*)',
          fnc: 'goto',
        },
      ],
    });

    [this.exploreBegin, this.fishBegin, this.gotoBegin] =
      placeInteractCmdHandler;
  }

  /** 0探索某处 */
  async explore(e) {
    // 1) 提取需要的数据
    const eData = {
      userMsg: e.msg,
      isGroup: e.isGroup || false,
      groupId: e.group_id || false,
      isPrivate: e.isPrivate || false,
      userId: `${e.user_id}`,
    };

    // 2) 交给专门的函数
    const replyMsg = await this.exploreBegin(eData);

    // 3) 收场
    return this.reply(e, replyMsg, true);
  }

  /** 1在某处饵钓 */
  async fish(e) {
    // 1) 提取需要的数据
    const eData = {
      userMsg: e.msg,
      isGroup: e.isGroup || false,
      groupId: e.group_id || false,
      isPrivate: e.isPrivate || false,
      userId: `${e.user_id}`,
    };

    // 2) 交给专门的函数
    const replyMsg = await this.fishBegin(eData);

    // 3) 收场
    return this.reply(e, replyMsg, true);
  }

  /** 2前往某处 */
  async goto(e) {
    // 1) 提取需要的数据
    const eData = {
      userMsg: e.msg,
      isGroup: e.isGroup || false,
      groupId: e.group_id || false,
      isPrivate: e.isPrivate || false,
      userId: `${e.user_id}`,
    };

    // 2) 交给专门的函数
    const replyMsg = await this.gotoBegin(eData);

    // 3) 收场
    return this.reply(e, replyMsg, true);
  }
}
