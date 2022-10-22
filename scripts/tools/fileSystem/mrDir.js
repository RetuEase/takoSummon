import fs from 'node:fs';
import PATH from './__PATH.js';

export const mkdir = async function (root, relPath = '') {
  return fs.promises.mkdir(`${PATH[root]}${relPath}`, { recursive: true });
};

/** 删文件记得加上后缀名 */
export const rm = async function (root, relPath = '') {
  const path = `${PATH[root]}${relPath}`;
  if (fs.existsSync(path)) return fs.promises.rm(path, { recursive: true });
};

export const readdirSync = function (root, relPath = '') {
  return fs.readdirSync(`${PATH[root]}${relPath}`);
};

export const readFolderSync = function (root, relPath = '') {
  return readdirSync(root, relPath).filter(fName => {
    return fs.statSync(`${PATH[root]}${relPath}/${fName}`).isDirectory();
  });
};
