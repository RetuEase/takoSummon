import { _ParentClass } from '../_ParentClass/_ParentClass.js';
import { segment } from 'oicq';
import Show from '../../views/show.js';

/**
 * 玩家查看游戏内基本信息图片的指令
 */

const IV_CMD_PRIOR = 200;
export const infoViewCmdHandler = [];

export class InfoViewCmd extends _ParentClass {
  constructor() {
    super({
      name: 'InfoViewCmd',
      dsc: '玩家查看游戏内基本信息图片的指令',
      event: 'message',
      priority: IV_CMD_PRIOR,
      rule: [
        {
          reg: '^#*(tk)?查?看?(游戏)?地图',
          fnc: 'checkMap',
        },
      ],
    });
  }

  /** 0查看游戏纯地图 */
  async checkMap(e) {
    const imgBuffer = await Show.getImgBuffer('gameMap');
    this.reply(e, segment.image(imgBuffer));
  }
}
