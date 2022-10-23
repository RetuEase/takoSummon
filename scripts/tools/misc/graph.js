import { getNowTimeStamp } from './misc.js';
import Config from '../fileSystem/config.js';

// 读一遍地图的图(Graph)
let gameMapGraph = (await Config.getConfig('gameSet', 'gameMap')).table;
Config.change_gameSet_gameMap = async function () {
  // 如果改变了，重新读
  gameMapGraph = (await Config.getConfig('gameSet', 'gameMap')).table;
};

// 路径对象模板
class Path {
  constructor(path, pathLen) {
    this.path = path;
    this.pathLen = pathLen;
  }
}

class PriorQueue {
  // 存的是{path:[],pathLen}，即pathObj们
  #queue = [];

  get length() {
    return this.#queue.length;
  }

  /**
   * 尝试新路径
   * @param {Object} prePathObj
   * @param {String} newPoint
   * @param {Number} dist
   */
  push(prePathObj, newPoint, dist) {
    // 1) 如果新点已经在路径里了就不要管了
    if (prePathObj.path.some(point => point === newPoint)) return;

    // 2) 创建新pathObj
    const newPathObj = new Path(
      prePathObj.path.slice().concat(newPoint),
      prePathObj.pathLen + dist
    );

    // 3) 找到应有的位置splice入
    // 找到第一个比它小的，为它的前一个
    let myFront = -1;
    for (let i = this.#queue.length - 1; i >= 0; i--) {
      if (this.#queue[i].pathLen < newPathObj.pathLen) {
        myFront = i;
        break;
      }
    }
    // const myFront = this.#queue.findLastIndex(
    //   pathObj => pathObj.pathLen < newPathObj.pathLen
    // ); // WARNING: rnm的nodejs不兼容findLastIndex
    // splice到后数第一个比它小的元素后方
    this.#queue.splice(myFront + 1, 0, newPathObj);
  }

  /**
   * 看看最短的到了没，没到就找新路径
   * @returns nearestPathObj
   */
  shift() {
    return this.#queue.shift();
  }
}

class Graph {
  // graph[pointNum]邻接表{'pointNum', edgeLen}
  #graphTpl = JSON.stringify(gameMapGraph);

  #getAdjacencyTable(graph, point) {
    // [point(str), dist(num)][]
    return Object.entries(graph[+point]);
  }

  /** 得到两个相邻点的距离 */
  getEdgeLen(point1, point2) {
    const graph = JSON.parse(this.#graphTpl);
    const adjcTable = this.#getAdjacencyTable(graph, point1);
    const point = adjcTable.find(adjacP => adjacP[0] === `${point2}`);
    return point ? point[1] : false;
  }

  /**
   * 放进来之前记得统一一下tasksArr里的informMsg为前往endPoint
   * @param {Number} commuteSpeed
   * @param  {...any} tasksArr 旧的一串“前往XX”obj(其实只有第一个和最后一个第第二个参数有用，中间的全填0都行)
   * @returns {Array} 新的一串“前往XX”obj（数组！！！）
   */
  getPathArr(commuteSpeed, ...tasksArr) {
    // 这里的time都是timestamp(ms)
    const nowTime = getNowTimeStamp();
    // 1) 从tasksArr里拿到我们要的数据
    // 'actApp actName informMsg sP,eP,hW? sT eT'
    const curTask = tasksArr.at(0); // 当前是或即将是curTask的action
    const { params } = curTask;
    const [startPoint, curEndPoint, halfway] = params;
    const endPoint = tasksArr.at(-1).params[1];

    // 2) 使用优先队列来BFS到最短路径
    const priorityQueue = new PriorQueue();
    const curGraph = JSON.parse(this.#graphTpl);

    // 3) 如果curTask是半途(除非是无行动->前往XX否则基本都是半途的了)
    // 从playerData/taskList那里弹出来之后也要先过这里一遍设置一下4、5
    // 上面那句是错误的，应该交给外面的函数来处理
    if (halfway) {
      // 4) 半途的话就有4、5了，半途的话要计算distance来加新点(0)
      const { startTime, endTime } = curTask;
      // NOTE: 这里我们用time*speed/60000来算distance，是会有问题的(speed和time是弱绑定的)
      const b2startDist = ((nowTime - +startTime) * commuteSpeed) / 60000;
      const b2curEndDist = ((+endTime - nowTime) * commuteSpeed) / 60000;

      curGraph[0][startPoint] = curGraph[+startPoint]['0'] = b2startDist;
      curGraph[0][curEndPoint] = curGraph[+curEndPoint]['0'] = b2curEndDist;

      // 5) 真·起始点为0，startPoint用作返回redisActString时的补充了
      const adjcTable = this.#getAdjacencyTable(curGraph, '0');

      adjcTable.forEach(point => {
        // 推入几个pathObj作为起始
        priorityQueue.push(new Path(['0'], 0), ...point);
      });
    }
    // 3) 如果curTask是无行动->前往XX
    else {
      // 4/5) 无行动->前往XX是未被外部函数更新过的，所以没有4、5，也不用加新点
      const adjcTable = this.#getAdjacencyTable(curGraph, startPoint);
      adjcTable.forEach(point => {
        // 推入几个pathObj作为起始
        priorityQueue.push(new Path([startPoint], 0), ...point);
      });
    }

    // 6) 使用初始化好的优先队列，执行BFS
    let bestPath = false;
    while (priorityQueue.length > 0) {
      // 1) 弹出队首
      const nearest = priorityQueue.shift();
      const lastPoint = nearest.path.at(-1); // BFS目前到达的点
      if (lastPoint === endPoint) {
        // BFS已到达最短的终点
        bestPath = nearest.path;
        break;
      }
      // 2) 获取邻接点压入队尾
      const adjcTable = this.#getAdjacencyTable(curGraph, lastPoint);
      adjcTable.forEach(point => {
        priorityQueue.push(nearest, ...point);
      });
    }

    // 7) 将最优路径格式化为n-1个obj放入数组中返回
    console.log(bestPath);
    const newTasksArr = bestPath
      .map((point, i, arr) => {
        // 如果是从0到出发点，那么可视为从首个目标点出发/折返；否则仍视为从原出发点出发
        if (point === '0') {
          // arr[i+1] = arr[1] = startPoint/curEndPoint
          const fakeStartPoint =
            startPoint === arr[i + 1] ? curEndPoint : startPoint;
          // sT是计算出来的，方便再次确认距离
          return {
            ...curTask,
            params: [fakeStartPoint, arr[i + 1], true], // sT,eT,hW
            startTime:
              nowTime - (curGraph[0][fakeStartPoint] / commuteSpeed) * 60000,
            endTime: nowTime + (curGraph[0][arr[i + 1]] / commuteSpeed) * 60000,
          };
        }

        // 非半途/半途后面的那些（当然第一个也要变成半途了，但这就不是我们的任务了）
        // NOTE: 外面的函数应当履行将非半途但推入当前行动的obj改为半途、计算4、5的责任
        if (i < arr.length - 1)
          return {
            ...curTask,
            params: [arr[i], arr[i + 1], false],
            // 不仅不计算，还要把你放进来的清空！ NOTE
            startTime: false,
            endTime: false,
          };

        // 终点，不用管，还要删
        return '';
      })
      .slice(0, -1);

    return newTasksArr;
  }
}

export default new Graph();
