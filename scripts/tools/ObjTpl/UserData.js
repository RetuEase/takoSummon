import { Tako } from './Thing.js';

export class UserInfo {
  constructor(userId, userName) {
    this.userId = userId; // QQ号
    this.userName = userName; // 用户名
    this.declaration = '略'; // 宣言
    this.ownTakoMulberry = []; // 已拥有tako桑
    this.ownTakoRain = []; // 已拥有tako雨露
    this.ownTakoShine = []; // 已拥有tako阳光
    this.autoJoinNewGame = false; // 自动加入新游戏
    this.participatedGameCount = 0; // 参与游戏场数
    this.lastGameTime = '未参与过游戏';
  }
}

/////////Gamer///////////

export class PlayerState {
  constructor() {
    this.locatedIn = '1';
    this.property = {
      mentionAdjust: [1, 0, 0],
      mention: [10, 0, 0],
      ease: [0, 0, 0],
      desperation: [0, 0, 0],
      justice: [0, 0, 0],
      charm: [0, 0, 0],
      abstract: [0, 0, 0],
    };
    this.gainAbility = {
      commuteSpeed: [10, 0, 0],
      exploreSpeed: [10, 0, 0],
      fishingSpeed: [10, 0, 0],
      processSpeed: {},
      processQuality: {},
      poolStorage: [30, 0, 0],
      storeStorage: [50, 0, 0],
      storeStack: [10, 0, 0],
    };
    this.limit = {
      full: [50, 0, 100],
      enough: [50, 0, 100],
    };
    this.desire = {
      0: {
        eat: [0, 0, 0],
        eatNeed: [50, 0, 0],
        eatHigh: [100, 0, 0],
        sex: [0, 0, 0],
        sexNeed: [50, 0, 0],
        sexHigh: [100, 0, 0],
      },
      1: {
        conquest: [0, 0, 0],
        conquestNeed: [0, 0, 0],
        conquestHigh: [0, 0, 0],
        beAwared: [0, 0, 0],
        beAwaredNeed: [0, 0, 0],
        beAwaredHigh: [0, 0, 0],
      },
      2: {
        knowledge: [0, 0, 0],
        knowledgeNeed: [0, 0, 0],
        knowledgeHigh: [0, 0, 0],
        selfProved: [0, 0, 0],
        selfProvedNeed: [0, 0, 0],
        selfProvedHigh: [0, 0, 0],
      },
    };
  }
}

export class Diplomacy {
  constructor() {
    this.relationList = [];
  }
}

export class ActionLog {
  constructor() {
    this.actionLogList = [];
  }
}

export class ProcessList {
  constructor() {
    this.processList = [];
  }
}

export class PoolList {
  constructor() {
    this.poolList = [new Tako(1, 1), new Tako(2, 1)];
  }
}

export class StoreList {
  constructor() {
    this.storeList = [];
  }
}
