import fs from 'node:fs';
import { getStrLen } from './scripts/tools/misc/misc.js';
import Config from './scripts/tools/fileSystem/config.js';

// 格式化版本信息
const curVerObj = await Config.getConfig('version', 'version');
let curVer = curVerObj.currentVersion;
const curVerLength = getStrLen(curVer);
if (curVerLength < 14) curVer = ` ${curVer} `; // 加中部空格
const verLog = `[tako召唤]${curVer}载入中~`;

// 格式化所有信息
const logsInfo = [
  '本插件基于Yunzai-Bot-V3运行',
  `${verLog}`,
  '作者RetuEase',
  '联系方式: QQ3573414538',
].map(logInfo => {
  const infoLength = getStrLen(logInfo);
  const restLength = 32 - infoLength;
  if (restLength) {
    logInfo = logInfo
      .padEnd(logInfo.length + Math.ceil(restLength / 2), ' ')
      .padStart(logInfo.length + restLength, ' '); // 加前部空格
  }
  return logInfo;
});

// 输出信息，两竖线间字符串长度为32
logger.info(`=-=-=-=-=-=-=-=TAKO=-=-=-=-=-=-=-=`);
logsInfo.forEach(logInfo => logger.info(`|${logInfo}|`));
logger.info(`---------------TAKO---------------`);

// 1) 获取js文件名列表
/** fs的路径名是根目录视角 */
const scriptPathCtrl = './plugins/takoSummon/scripts/controllers';
const scriptPathApp = './plugins/takoSummon/scripts/apps';

// controllers下的只import一遍不存
const scriptNamesCtrl = fs
  .readdirSync(scriptPathCtrl)
  .flatMap(dirName => {
    // 如果是文件夹，那么再读一层，返回子文件加上文件夹名的路径的数组
    if (!fs.statSync(`${scriptPathCtrl}/${dirName}`).isFile()) {
      // 如果是父类文件夹就跳过
      if (dirName === '_parentClass') return [];
      return fs
        .readdirSync(`${scriptPathCtrl}/${dirName}`)
        .map(fileName => `${dirName}/${fileName}`);
    }
    return dirName;
  })
  .filter(fileName => fileName.endsWith('.js'));
scriptNamesCtrl.forEach(scriptName =>
  import(`./scripts/controllers/${scriptName}`)
);

// apps下的import然后存
const scriptNamesApp = fs
  .readdirSync(scriptPathApp)
  .flatMap(dirName => {
    // 如果是文件夹，那么再读一层，返回子文件加上文件夹名的路径的数组
    if (!fs.statSync(`${scriptPathApp}/${dirName}`).isFile()) {
      // 如果是父类文件夹就跳过
      if (dirName === '_ParentClass') return [];
      return fs
        .readdirSync(`${scriptPathApp}/${dirName}`)
        .map(fileName => `${dirName}/${fileName}`);
    }
    return dirName;
  })
  .filter(fileName => fileName.endsWith('.js'));

// 2) 获取 import成败-js文件 列表
/** import的路径名是当前目录视角 */
let scriptLoads = scriptNamesApp.map(scriptName =>
  import(`./scripts/apps/${scriptName}`)
);

scriptLoads = await Promise.allSettled(scriptLoads);

// 3) 把import成功的js文件放入apps对象并导出
const apps = {};

scriptNamesApp.forEach((scriptName, i) => {
  const name = scriptName.split('/').at(-1).replace('.js', '');

  if (scriptLoads[i].status === 'fulfilled') {
    // NOTE: 要获取的属性名是js文件导出的类名(这样一个js文件可以导出多个类)，所以一定要类名、文件名一致才能直接用name来取
    apps[name] = scriptLoads[i].value[name];
  } else {
    logger.error(`载入插件错误：${logger.red(name)}`);
    logger.error(scriptLoads[i].reason);
  }
});

export { apps };
