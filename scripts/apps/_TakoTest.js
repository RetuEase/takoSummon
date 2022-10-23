import plugin from '../../../../lib/plugins/plugin.js'; // BASE
import { readYaml, writeYaml } from '../tools/fileSystem/rwYaml.js'; // TEST1
import { segment } from 'oicq'; // BASE TEST2
import Config from '../tools/fileSystem/config.js'; // TEST3 4 5
import Show from '../views/show.js'; // TEST3
import XLSX from 'node-xlsx'; // TEST4
import Graph from '../tools/misc/graph.js'; // TEST5
import { getNowTimeStamp } from '../tools/misc/misc.js'; // TEST5
import { push } from '../models/taskModel/userTaskModel.js'; // TEST6
import { getGameId } from '../tools/fileSystem/inspect.js';

/**
 * 用户在每轮游戏外的基本指令
 */
const TEST_PRIOR = 200;

/** 前往的calc一定记得加半途！ */
export const calc_takoTest = async function (userAct) {
  const {
    params: [point1, point2],
  } = userAct;
  userAct.params[2] = true; // 加半途

  const nowTime = getNowTimeStamp();
  const endTime =
    nowTime + ((await Graph.getEdgeLen(point1, point2)) / 10) * 60000;
  return [nowTime, endTime];
};

export const takoTest = async function (curUserAct) {
  const { informMsg, params, isGroup, isPrivate, groupId, userId } = curUserAct;
  console.log(`I have been called! ${userId} ${params}`);
  return {
    informMsg: `${params[0]}${informMsg}${params[1]}`,
    isGroup,
    isPrivate,
    groupId,
    userId,
  };
};

export class _TakoTest extends plugin {
  constructor() {
    super({
      name: '_TakoTest',
      dsc: 'tako测试',
      event: 'message',
      priority: TEST_PRIOR,
      rule: [
        {
          reg: '^#tk(测试|猪币)',
          fnc: 'takoTest',
        },
        {
          reg: '同步redis',
          fnc: 'syncRedis',
        },
      ],
    });
  }

  async takoTest(e) {
    // INFO TEST1 221016 转发消息
    // const msgs = ['猪', '币', '爸把'];
    // this.reply(e, await this.makeForwardMsg(msgs));
    // Bot.sendPrivateMsg(981844432, msgs);
    // INFO TEST2 221017 yaml数字和字符串
    // console.log(e.user_id === '1099177812');
    // await writeYaml('log', 'test', {
    //   userId: e.user_id,
    //   array: [e.user_id],
    // });
    // const testObj = await readYaml('log', 'test');
    // console.log(testObj.array.includes('1099177812'));
    // console.log(testObj.array.includes(1099177812));
    // INFO TEST3 221018 试用puppeteer
    // const verObj = await Config.getConfig('version', 'version');
    // const helpData = await Config.getConfig('help', 'helpMain');
    // const img = await Show.getScreenshot('help', {
    //   version: verObj.currentVersion,
    //   helpData,
    // });
    // this.reply(e, img);
    // INFO TEST4 221019 试读xlsx 1)
    // const takoNuEfObj = JSON.parse(
    //   this.getXlsxSets('tako', 'nutritionEffect')[12]
    // );
    // console.log(Object.keys(takoNuEfObj));
    // console.log(takoNuEfObj.property.justice); // 达咩
    // console.log(takoNuEfObj['property.justice']);
    // xlsx功能拆分后 2)
    // const takoNuEfObj = JSON.parse(
    //   (await Config.getConfig('tako', 'nutritionEffect', true))[12]
    // );
    // console.log(Object.keys(takoNuEfObj));
    // console.log(takoNuEfObj['property.justice']);
    // INFO TEST5 221020 试用我自己写的搜索最短路径
    // const newTasksArr = Graph.getPathArr(
    //   10,
    //   {
    //     actApp: 'PlayerTravel',
    //     actName: 'goTo',
    //     informMsg: '前往钢铁丛林',
    //     params: ['1', '2', false],
    //   },
    //   {
    //     actApp: 'PlayerTravel',
    //     actName: 'goTo',
    //     informMsg: '前往钢铁丛林',
    //     params: ['2', '4', false],
    //   },
    //   {
    //     actApp: 'PlayerTravel',
    //     actName: 'goTo',
    //     informMsg: '前往钢铁丛林',
    //     params: ['4', '5', false],
    //   },
    //   {
    //     actApp: 'PlayerTravel',
    //     actName: 'goTo',
    //     informMsg: '前往钢铁丛林',
    //     params: ['5', '6', false],
    //   }
    // );
    // newTasksArr.forEach(msg => console.log(msg));
    // 非半途
    // const dist = (await Config.getConfig('gameSet', 'gameMap'))[4]['1'];
    // const fakeStartTime = getNowTimeStamp() - 180000;
    // const fakeEndTime = fakeStartTime + (dist / 10) * 60000;
    // console.log(fakeStartTime, fakeEndTime);
    // const newTasksArr = Graph.getPathArr(
    //   10,
    //   {
    //     actApp: 'PlayerTravel',
    //     actName: 'goTo',
    //     informMsg: '前往钢铁丛林',
    //     params: ['4', '1', true],
    //     startTime: fakeStartTime,
    //     endTime: fakeEndTime,
    //   },
    //   {
    //     actApp: 'PlayerTravel',
    //     actName: 'goTo',
    //     informMsg: '前往钢铁丛林',
    //     params: ['0', '6', false],
    //   }
    // ); // 半途
    // newTasksArr.forEach(msg => console.log(msg));
    // INFO TEST6 221021 221022
    const gameId = await getGameId();
    if (!gameId) return this.reply(e, '忘记开始游戏啦');
    const userId = e.user_id;
    const curTask = await redis.get(`takoSummon:${userId}:curUserAct`);
    // WARNING: 记得检查有没有加入游戏
    const newTask1 = {
      actApp: '_TakoTest',
      actName: 'takoTest',
      informMsg: '前往',
      params: ['1', '2', false],
      isGroup: e.isGroup || false,
      groupId: e.group_id || false,
      isPrivate: e.isPrivate || false,
      userId: e.user_id,
    };
    const newTask2 = {
      actApp: '_TakoTest',
      actName: 'takoTest',
      informMsg: '前往',
      params: ['2', '3', false],
      isGroup: e.isGroup || false,
      groupId: e.group_id || false,
      isPrivate: e.isPrivate || false,
      userId: e.user_id,
    };
    // redis-takoSummon:userId:curUserAct里有没有东西
    // 1) 有东西
    if (curTask) {
      const curUserAct = JSON.parse(curTask);
      this.reply(e, `当前行动:${curUserAct.informMsg}`);
      await push(userId, newTask2);
      return this.reply(e, '加到任务列表里了！');
    }
    await push(userId, newTask1, 10);

    return this.reply(e, '等待回调函数吧！');
  }

  // TEST4 221019 试读xlsx 1)
  // getXlsxSets(app, name) {
  //   const worksheets = XLSX.parse(
  //     './plugins/takoSummon/resources/xlsx/set.xlsx'
  //   );

  //   const rows = worksheets.find(sheet => sheet.name === app).data;
  //   const targetArrIndex = rows[0].findIndex(key => key === name);
  //   const targetArr = rows.slice(1).map(row => row[targetArrIndex]);
  //   return targetArr;
  // }

  // TEST1 221016 制作转发消息
  /**
   * 将一个数组的消息转化为合并转发消息
   * @param msg
   * @returns 合并转发消息
   */
  // async makeForwardMsg(msg) {
  //   const fMsg = msg.map(m => {
  //     return { message: m, nickname: Bot.nickname, user_id: Bot.uin };
  //   });
  //   return Bot.makeForwardMsg(fMsg);
  // }

  /**
   * 回复某条e
   * @param e 消息对象
   * @param msg 发送的消息
   * @param quote 是否at
   */
  async reply(e, msg = '', quote = false) {
    if (quote) msg = [segment.at(e.user_id), `\n${msg}`];
    return e.reply(msg);
  }
}
