import fs from 'node:fs';
import YAML from 'yaml';
import PATH from './__PATH.js';

/**
 * 注重顺序就用await！
 * 全用异步吧别管那么多了！
 * 可靠性不管了！writeYaml也不await了！
 */

/** 后面已经自带yaml后缀了 */
export const getYamlPath = function (root, relPath) {
  return `${PATH[root]}${relPath}.yaml`;
};

/**
 * 读某个yaml
 * @param root 根目录
 * @param relPath 相对路径
 * @returns yaml的obj，若yaml不存在返回空对象
 */
export const readYaml = async function (root, relPath) {
  const path = getYamlPath(root, relPath);
  // 如果路径存在且是文件
  if (fs.existsSync(path) && fs.statSync(path).isFile())
    return new Promise(async resolve => {
      const Yamlobj = YAML.parse(await fs.promises.readFile(path, 'utf-8'));
      resolve(Yamlobj);
    });
  else return {};
};

/**
 * 写某个yaml
 * @param root 根目录
 * @param relPath 相对路径
 * @param obj 写入的obj
 */
export const writeYaml = async function (root, relPath, obj) {
  const path = getYamlPath(root, relPath);
  return fs.promises.writeFile(path, YAML.stringify(obj), 'utf-8');
};
