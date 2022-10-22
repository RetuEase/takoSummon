import XLSX from 'node-xlsx';
import PATH from './__PATH.js';

export const getXlsxPath = function () {
  return `${PATH.resource}xlsx/set.xlsx`;
};

/**
 * 获取一列xlsx的数据数组
 * @param app 工作表名
 * @param name 列标题名
 * @returns 列数组
 */
export const readXlsxCol = function (app, name) {
  // 1) 读取所有工作表，找到目标(app)工作表
  const worksheets = XLSX.parse(getXlsxPath());
  const rows = worksheets.find(sheet => sheet.name === app).data;

  // 2) 遍历第一行(标题)，找到对应的列(name)
  const targetArrIndex = rows[0].findIndex(key => key === name);
  const targetArr = rows.slice(1).map(row => row[targetArrIndex]);

  // 3) 返回这一列上所有值组成的数组
  return targetArr;
};
