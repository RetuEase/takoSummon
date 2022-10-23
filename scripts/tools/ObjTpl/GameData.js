export class GameInfo {
  constructor(startT) {
    this.gameStartTime = startT;
    this.gameEndTime = '待定';
    this.gameRunDay = 0;
  }
}

export class TimingTask {
  /**
   * @param {String|Number} endTime 都可以，都会转化为数字存储
   */
  constructor(userId, endTime) {
    this.userId = userId;
    this.endTime = +endTime;
  }
}
