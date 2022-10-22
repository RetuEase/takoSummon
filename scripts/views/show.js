import fs from 'node:fs';
import chokidar from 'chokidar';
// 以上为纯图特殊照顾
import PATH from '../tools/fileSystem/__PATH.js';
import Puppeteer from '../../../../lib/puppeteer/puppeteer.js';

class Show {
  constructor() {
    // name: [dataCode(Symbol(JSON)), img]
    this.screenshotBuffer = {}; // 缓存区
    this.absResPath = `${process
      .cwd()
      .replace(/\\/g, '/')}${PATH.resource.replace('.', '')}`;
    this.defShowSet = {
      saveId: '_default',
      absResPath: this.absResPath, // 绝对路径，用于html中读取
      headStyle: `<style> .head_box { background: url(${this.absResPath}/img/namecard/柯莱.png) #fff; background-position-x: 42px; background-repeat: no-repeat; background-size: auto 101%; }</style>`, // 帮助上面的主题
    };

    // 以下为纯图特殊照顾
    this.pureImgWatcher = {}; // watcher
    this.pureImgBuffer = {}; // 缓存区
  }

  /**
   * 依据html模板和展示数据生成图片
   * @param name html模板类型名（'playerInfo'）
   * @param data 需要展示的数据
   * @return 图片
   */
  async getScreenshot(name, data = {}) {
    // 1) 在data里补充点必须的东西
    data = {
      ...this.defShowSet,
      ...data,
    };
    data.tplFile = `${PATH.resource}html/${name}/${name}.html`;

    // 2) 如果同一个name、两次data完全一致，则不需要再生成，直接返回
    const newDataCode = Symbol(JSON.stringify(data));
    if (
      this.screenshotBuffer[name] &&
      this.screenshotBuffer[name].dataCode === newDataCode
    )
      return this.screenshotBuffer[name].img;

    // 3) 否则生成图片并加入到缓存区中，然后返回图片
    this.screenshotBuffer[name] = {
      dataCode: newDataCode,
      img: await Puppeteer.screenshot(name, data),
    };
    return this.screenshotBuffer[name].img;
  }

  async getImgBuffer(name) {
    // 1) 如果Show里有记录，直接返回
    if (this.pureImgBuffer[name]) return this.pureImgBuffer[name];
    // 没有，则读取并存起来
    const path = `${PATH.resource}img/pure/${name}.png`;
    this.pureImgBuffer[name] = fs.readFileSync(path);

    // 2) 如果已经添加watcher，不用再添加
    if (this.pureImgWatcher[name]) return this.pureImgBuffer[name];
    // 还没添加，就添加
    const watcher = chokidar.watch(path);
    watcher.on('change', () => {
      // 3) 改变了，清除在Show的记录
      delete this.pureImgBuffer[name];
      logger.mark(`[tako修改纯图][name]`);
    });
    this.pureImgWatcher[name] = watcher;

    // 4) 最终返回
    return this.pureImgBuffer[name];
  }
}

export default new Show();
