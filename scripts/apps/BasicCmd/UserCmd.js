import { _ParentClass } from '../_ParentClass/_ParentClass.js';

/**
 * 用户在每轮游戏外的基本指令
 */

const BASIC_CMD_PRIOR = 200;
export const userCmdHandler = [];

export class UserCmd extends _ParentClass {
  constructor() {
    super({
      name: 'UserCmd',
      dsc: '用户在每轮游戏外的基本指令',
      event: 'message',
      priority: BASIC_CMD_PRIOR,
      rule: [
        {
          reg: '^#*tako召唤注册',
          fnc: 'takoSummonRegister',
        },
        {
          reg: '^#*tako召唤注销',
          fnc: 'takoSummonClose',
        },
        {
          reg: '^#*(tk)?(个人|我的)信息',
          fnc: 'userInformation',
        },
        {
          reg: '^#*(tk)?改名(.*)',
          fnc: 'userSetName',
        },
        {
          reg: '^#*(tk)?设置?宣言(.*)',
          fnc: 'userSetDeclaration',
        },
        {
          reg: '^#*(tk)?(设置)?自动加?入?新?游戏(.*)',
          fnc: 'userSetAutoJoin',
        },
        {
          reg: '^#*(tk)?加入(新|当前)?游戏',
          fnc: 'userJoinCurrentGame',
        },
        {
          reg: '^#*(tk)?退出(此|当前)?游戏',
          fnc: 'userExitCurrentGame',
        },
      ],
    });
    // 接收handler函数
    [
      this.register,
      this.close,
      this.seeInfo,
      this.setName,
      this.setDeclaration,
      this.setAutoJoin,
      this.joinCurrentGame,
      this.exitCurrentGame,
    ] = userCmdHandler;
  }

  /** 0新用户注册账号 */
  async takoSummonRegister(e) {
    // 1) 提取需要的数据
    const eData = {
      userId: `${e.user_id}`,
      userName: e.sender.card, // 初始用户名
    };

    // 2) 交给专门的函数
    const replyMsg = await this.register(eData);

    // 3) 收场
    return this.reply(e, replyMsg, true);
  }

  /** 1老用户注销账号 */
  async takoSummonClose(e) {
    // 1) 提取需要的数据
    const eData = {
      userId: `${e.user_id}`,
    };

    // 2) 交给专门的函数
    const replyMsg = await this.close(eData);

    // 3) 收场
    return this.reply(e, replyMsg, true);
  }

  /** 2查看用户的个人信息 */
  async userInformation(e) {
    // 1) 提取需要的数据
    const eData = {
      userId: `${e.user_id}`,
    };

    // 2) 交给专门的函数，返回个人信息列表
    const replyMsgArray = await this.seeInfo(eData);
    // TODO2) 交给专门的函数，返回img图片
    // const replyImg = await this.seeInfo(eData);

    // 3) 收场
    return this.reply(e, await this.makeForwardMsg(replyMsgArray));
    // return this.reply(e, replyImge);
  }

  /** 3设置用户的用户名 */
  async userSetName(e) {
    // 1) 提取需要的数据
    const eData = {
      userId: `${e.user_id}`,
      userMsg: e.msg, // 读后面的字
    };

    // 2) 交给专门的函数
    const replyMsg = await this.setName(eData);

    // 3) 收场
    return this.reply(e, replyMsg, true);
  }

  /** 4设置用户的宣言 */
  async userSetDeclaration(e) {
    // 1) 提取需要的数据
    const eData = {
      userId: `${e.user_id}`,
      userMsg: e.msg, // 读后面的字
    };

    // 3) 交给专门的函数
    const replyMsg = await this.setDeclaration(eData);

    // 4) 收场
    return this.reply(e, replyMsg, true);
  }

  /** 5设置用户是否自动加入新游戏 */
  async userSetAutoJoin(e) {
    // 1) 提取需要的数据
    const eData = {
      userId: `${e.user_id}`,
      userMsg: e.msg, // 读后面的字
    };

    // 3) 交给专门的函数
    const replyMsg = await this.setAutoJoin(eData);

    // 3) 收场
    return this.reply(e, replyMsg, true);
  }

  /** 6将用户加入当前游戏 */
  async userJoinCurrentGame(e) {
    // 1) 提取需要的数据
    const eData = {
      userId: `${e.user_id}`,
    };

    // 2) 交给专门的函数
    const replyMsg = await this.joinCurrentGame(eData);

    // 3) 收场
    return this.reply(e, replyMsg);
  }

  /** 7将用户移出当前游戏 */
  async userExitCurrentGame(e) {
    // 1) 提取需要的数据
    const eData = {
      userId: `${e.user_id}`,
    };

    // 2) 交给专门的函数
    const replyMsg = await this.exitCurrentGame(eData);

    // 3) 收场
    return this.reply(e, replyMsg);
  }
}
