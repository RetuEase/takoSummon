import plugin from '../../../../../lib/plugins/plugin.js';
import { segment } from 'oicq';

export class _ParentClass extends plugin {
  constructor(defineObj) {
    super(defineObj);
  }

  /**
   * 将一个数组的消息转化为合并转发消息
   * @param msg
   * @returns 合并转发消息
   */
  async makeForwardMsg(msg) {
    const fMsg = msg.map(m => {
      return { message: m, nickname: Bot.nickname, user_id: Bot.uin };
    });
    return Bot.makeForwardMsg(fMsg);
  }

  /**
   * 回复某条e
   * @param e 消息对象
   * @param msg 发送的消息
   * @param quote 是否at
   */
  async reply(e, msg = '', quote = false) {
    // 如果at且在群里就at
    if (quote && e.isGroup) msg = [segment.at(e.user_id), `\n${msg}`];
    return e.reply(msg);
  }

  /**
   * 给某位 好友 发消息
   * @param userId 好友QQ号
   * @param msg 发送的消息
   */
  async sendPrivate(userId, msg = '') {
    // 1) 获取好友对象 client.fl->Map 好友列表
    const friend = Bot.fl.get(+userId);
    // 2) 如果是好友就发送私人消息
    if (friend) {
      Bot.logger.mark(`tako发送好友消息[${friend.nickname}](${userId})`);
      // 3) client.pickUser() // NOTE: 老办法
      //   return Bot.pickUser(userId)
      //     .sendMsg(msg)
      //     .catch(err => Bot.logger.mark(err));
      // 3) client.sendPrivateMsg()
      return Bot.sendPrivateMsg(+userId, msg).catch(err =>
        Bot.logger.mark(err)
      );
    }
  }

  /**
   * 在某个群里发消息
   * @param groupId 群号
   * @param msg 发送的消息
   * @param at at的群友的QQ号
   */
  async sendGroup(groupId, msg = '', at = '') {
    // 1) 获取群对象 client.gl->Map 群列表
    const group = Bot.gl.get(+groupId);
    // 2) 如果获取到了就发送群消息
    if (group) {
      Bot.logger.mark(`tako发送群消息[${group.name}](${groupId})`);
      // 3) client.pickGroup()
      if (at) msg = [segment.at(at), `\n${msg}`];
      return Bot.sendGroupMsg(+groupId, msg).catch(err => Bot.logger.mark(err));
    }
  }

  // INFO: Test
  async syncRedis() {
    const gameId = getGameId();
    // 检查任务列表并加载到Redis
    // 1) 遍历用户数据文件夹，参考index.js并列读取autoJoinNewGame
    const uIdOrder = [];
    const utProms = readFolderSync('userData').map(uId => {
      uIdOrder.push(uId);
      return readYaml('userData', `${uId}/${gameId}/${FNAME.taskList}`);
    });
    const utLoads = await Promise.allSettled(utProms);

    // 2) 如果发现非空，就把第一个设置为对应的redis
    utLoads.forEach(({ status, value: utList }, index) => {
      // 如果读不到gameId文件夹自然会失败
      if (status !== 'fulfilled') return;
      if (utList.length > 0)
        redis.set(
          `takoSummon:${uIdOrder[index]}:curUserAct`,
          JSON.stringify(utList[0])
        );
    });
  }
}

// Functions
import { readYaml, writeYaml } from '../../tools/fileSystem/rwYaml.js';
import { mkdir, rm, readFolderSync } from '../../tools/fileSystem/mrDir.js';
import FNAME from '../../tools/fileSystem/__FILE_NAME.js';
