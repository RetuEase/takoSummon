/**
 * 向监听器们提供回调函数
 */

// userOpera
import * as UserCmd from './basicCmd/userCmdCtrler.js';

// userAct
import * as _TakoTest from '../apps/_TakoTest.js';
import * as placeInteractCmdCtrler from './gameCmd/placeInteractCmdCtrler.js';

// userQuery

export default { UserCmd, _TakoTest, placeInteractCmdCtrler };
