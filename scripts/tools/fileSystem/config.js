import { getYamlPath, readYaml } from './rwYaml.js';
import chokidar from 'chokidar';
import { getXlsxPath, readXlsxCol } from './readXlsx.js';

class Config {
  constructor() {
    /** Config中存着的配置 */
    this.defSet = {};
    this.config = {};
    this.xlsx = {};
    /** 正在监听的watcher，xlsx只需要一个 */
    this.watcher = { defSet: {}, config: {}, xlsx: null };
  }

  /**
   * 获取yaml并存在Config中
   * @param app 功能
   * @param name 名称
   * @param type 默认defSet，用户配置config，Excel用xlsx
   * @returns
   */
  async #getYaml(app, name, type) {
    const key = `${app}.${name}`;

    // 1) 如果已经在Config里了直接返回之
    if (this[type][key]) return this[type][key];

    // 2) 否则读取并存起来，然后设置监听
    const relPath = type === 'defSet' ? `${app}/${name}` : key;
    this[type][key] = readYaml(type, relPath);
    this.#watch(app, name, type);

    // 3) 然后返回读取值
    return this[type][key];
  }

  /**
   * 获取一列xlsx的数据数组并存在Config中
   * @param app 工作表名
   * @param name 列标题名
   * @returns 列数组
   */
  #getXlsxCol(app, name) {
    const key = `${app}.${name}`;

    // 1) 如果已经在Config里了直接返回之
    if (this.xlsx[key]) return this.xlsx[key];

    // 2) 否则读取并存起来，然后设置监听
    this.xlsx[key] = readXlsxCol(app, name);
    // 检查watcher是否已经在监听了
    if (this.watcher.xlsx) return this.xlsx[key];

    // 3) 设置新监听
    const watcher = chokidar.watch(getXlsxPath());
    watcher.on('change', () => {
      // 改变了，清除在Config的记录
      delete this.xlsx[key];
      logger.mark(`[tako修改配置文件][xlsx]`);
    });
    // 添加到watcher
    this.watcher.xlsx = watcher;

    // 4) 然后再返回
    return this.xlsx[key];
  }

  /** 监听配置文件 */
  #watch(app, name, type) {
    const key = `${app}.${name}`;

    // 1) 检查watcher是否已经在监听了
    if (this.watcher[type][key]) return;

    // 2) 设置新监听
    const watcher = chokidar.watch(getYamlPath(type, `${app}/${name}`));
    watcher.on('change', () => {
      // 3) 改变了，清除在Config的记录
      delete this[type][key];
      logger.mark(`[tako修改配置文件][${type}][${app}][${name}]`);
      // 4) 以及执行外部硬塞给Config的新任务 目前有:graph.js
      if (this[`change_${app}_${name}`]) {
        this[`change_${app}_${name}`]();
      }
    });

    // 4) 添加到watcher
    this.watcher[type][key] = watcher;
  }

  /** 获取默认配置文件信息 */
  async #getDefSet(app, name) {
    return this.#getYaml(app, name, 'defSet');
  }

  /** 获取部署者配置文件信息，如果是Excel第三项填true，返回列的数组 */
  async getConfig(app, name, xlsx = false) {
    if (xlsx) return this.#getXlsxCol(app, name);
    // 如果config读到东西了会把defSet覆盖掉
    return {
      ...(await this.#getDefSet(app, name)),
      ...(await this.#getYaml(app, name, 'config')),
    };
  }
}

export default new Config();
