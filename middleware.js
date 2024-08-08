const axios = require('axios');
const url = "http://localhost:8080/otto"
/**
 * 获取本地服务响应
 * @param {string} path 本地服务路由
 * @param {number} timeout 超时时间
 * @example
 */
// async function accessLocalService(path, body, timeout) {
//   try {
//     const response = await Promise.race([
//       axios.post(url + path, body, {
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       }),
//       new Promise((_, reject) =>
//         setTimeout(() => reject(new Error(path + 'Request timeout')), timeout)
//       )
//     ]);
//     if (response.data.code == 200 && ('data' in response.data)) {
//       return response.data.data;
//     } else {
//       console.error(path + 'Error fetching response:', response.data);
//       return null;
//     };
//   } catch (error) {
//     console.error(path + 'Error fetching response:', error);
//     throw error;
//   }
// }

async function accessLocalService(path, body, timeout) {
  return await axios.post(url + path, body, { headers: { 'Content-Type': 'application/json' }, timeout: timeout })
    .then(({ status, statusText, headers, config, request, data }) => data?.data)
    .catch(({ message, name, code, config, request, response }) => console.error(path, name, code, message))
}

/**
 * 消息监听函数和回调函数
 * @param {string} imtype 消息类型
 * @param {string} chatid 群组ID
 * @param {string} userid 用户ID
 * @param {function} callback 回调函数
 */
function addMsgListener(imtype, chatid, userid, callback) {
  const options = {
    method: 'POST',
    body: JSON.stringify({ "imtype": imtype, "chatid": chatid, "userid": userid }),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const req = http.request(url, options, (res) => {
    res.setEncoding('utf8');
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      callback(responseData);
    });
  });
}

// 获取发送者ID
function getSenderID() {
  console.log(process.argv);
  const arg = process.argv[1];
  return arg
}


function render(template, selector, data) {
  return accessLocalService(`/render`, { template: template, selector: selector, data: data }, 5000);
}
// 推送消息
function push(imType, groupCode, userID, title, content) {
  accessLocalService(`/push`,
    {
      imType: imType,
      groupCode: groupCode,
      userID: userID,
      title: title,
      content: content,
    }, 5000);
}

// 获取机器人名称
function name() {
  return accessLocalService(`/name`, null, 5000);
}

// 获取机器id
function machineId() {
  return accessLocalService(`/machineId`, null, 5000);
}

// 获取机器人版本
function version() {
  return accessLocalService(`/version`, null, 5000);
}

// 获取数据库数据
function get(key) {
  return accessLocalService(`/get`, { key: key }, 5000);
}

// 设置数据库数据
function set(key, value) {
  return accessLocalService(`/set`, { key: key, value: value }, 5000);
}

// 删除数据库数据
function del(key) {
  return accessLocalService(`/del`, { key: key }, 5000);
}

// 获取指定数据库指定的key值
function bucketGet(bucket, key) {
  return accessLocalService(`/bucketGet`, { bucket: bucket, key: key }, 5000);
}

// 设置指定数据库指定的key值
function bucketSet(bucket, key, value) {
  return accessLocalService(`/bucketSet`, { bucket: bucket, key: key, value: value }, 5000);
}

// 删除指定数据库指定key的值
function bucketDel(bucket, key) {
  return accessLocalService(`/bucketDel`, { bucket: bucket, key: key }, 5000);
}

// 获取指定数据库所有值为value的keys
async function bucketKeys(bucket, value) {
  return await accessLocalService(`/bucketKeys`, { bucket: bucket, value: value }, 5000);
}

// 获取指定数据桶内所有的key集合
async function bucketAllKeys(bucket) {
  return await accessLocalService(`/bucketAllKeys`, { bucket: bucket }, 5000);
}

// 获取指定数据桶内所有的key value集合
async function bucketAll(bucket) {
  return await accessLocalService(`/bucketAll`, { bucket: bucket }, 5000);
}

// 通知管理员
function notifyMasters(content, imtypes = []) {
  return accessLocalService(`/notifyMasters`, { content: content, imtypes: imtypes }, 5000);
}

// 当前系统咖啡码激活状态
function coffee() {
  return accessLocalService(`/coffee`, null, 5000);
}

// 京东、淘宝、拼多多转链推广
function spread(msg) {
  return accessLocalService(`/spread`, { msg: msg }, 5000);
}

class Sender {
  constructor(senderID) {
    // 发送者ID,格式：in64时间戳,
    this.senderID = senderID;
    // 获取指定数据库指定的key值
    this.bucketGet = function (bucket, key) {
      return accessLocalService(`/bucketGet`, { senderid: senderID, bucket: bucket, key: key }, 5000);
    }

    // 设置指定数据库指定的key值
    this.bucketSet = function (bucket, key, value) {
      return accessLocalService(`/bucketSet`, { senderid: senderID, bucket: bucket, key: key, value: value }, 5000);
    }

    // 删除指定数据库指定key的值
    this.bucketDel = function (bucket, key) {
      return accessLocalService(`/bucketDel`, { senderid: senderID, bucket: bucket, key: key }, 5000);
    }

    // 获取指定数据库所有值为value的keys
    this.bucketKeys = async function (bucket, value) {
      return await accessLocalService(`/bucketKeys`, { senderid: senderID, bucket: bucket, value: value }, 5000);
    }

    // 获取指定数据桶内所有的key集合
    this.bucketAllKeys = async function (bucket) {
      return await accessLocalService(`/bucketAllKeys`, { senderid: senderID, bucket: bucket }, 5000);
    }

    // 获取指定数据桶内所有的key value集合
    this.bucketAll = async function (bucket) {
      return await accessLocalService(`/bucketAll`, { senderid: senderID, bucket: bucket }, 5000);
    }

    this.setContinue = function () {
      return accessLocalService(`/continue`, { senderid: senderID }, 5000);
    }

    // 路由路径
    this.getRouterPath = function () {
      return accessLocalService(`/getRouterPath`, { senderid: senderID }, 5000);
    }
    // 路由参数
    this.getRouterParams = function () {
      return accessLocalService(`/getRouterParams`, { senderid: senderID }, 5000);
    }
    // 路由方法
    this.getRouterMethod = function () {
      return accessLocalService(`/getRouterMethod`, { senderid: senderID }, 5000);
    }
    // 路由请求头
    this.getRouterHeaders = function () {
      return accessLocalService(`/getRouterHeaders`, { senderid: senderID }, 5000);
    }
    // 路由cookies
    this.getRouterCookies = function () {
      return accessLocalService(`/getRouterCookies`, { senderid: senderID }, 5000);
    }
    // 路由请求体
    this.getRouterBody = function () {
      return accessLocalService(`/getRouterBody`, { senderid: senderID }, 5000);
    }

    // 获取发送者渠道
    this.getImtype = function () {
      return accessLocalService(`/getImtype`, { senderid: senderID }, 5000);
    }

    // 获取当前用户id
    this.getUserID = function () {//注意：这里是base64编码后的userid
      return accessLocalService(`/getUserID`, { senderid: senderID }, 5000);
    }

    // 获取当前用户名
    this.getUserName = function () {
      return accessLocalService(`/getUserName`, { senderid: senderID }, 5000);
    }

    // 获取用户头像url
    this.getUserAvatarUrl = function () {
      return accessLocalService(`/getUserAvatarUrl`, { senderid: senderID }, 5000);
    }

    // 获取当前群组id
    this.getChatID = function () {
      return accessLocalService(`/getChatID`, { senderid: senderID }, 5000);
    }

    // 获取当前群组名称
    this.getGroupName = function () {
      return accessLocalService(`/getGroupName`, { senderid: senderID }, 5000);
    }

    // 是否管理员
    this.isAdmin = function () {
      return accessLocalService(`/isAdmin`, { senderid: senderID }, 5000);
    }

    // 获取消息
    this.getMessage = function () {
      return accessLocalService(`/getMessage`, { senderid: senderID }, 5000);
    }

    // 获取消息ID
    this.getMessageID = function () {
      return accessLocalService(`/getMessageID`, { senderid: senderID }, 5000);
    }

    // 获取历史消息ids
    this.getHistoryMessageIDs = function (number) {
      return accessLocalService(`/getHistory`, { senderid: senderID, number: number }, 5000);
    }

    // 撤回消息
    this.recallMessage = function (messageid) {
      return accessLocalService(`/recallMessage`, { senderid: senderID, messageid: messageid }, 5000);
    }

    // 模拟新消息输入，即将消息发送者的消息修改为新的内容，重新送往autMan内部处理
    this.breakIn = function (content) {
      accessLocalService(`/breakIn`, { senderid: senderID, content: content }, 5000);
    }

    // 获取匹配的文本参数
    this.param = function (index) {
      return accessLocalService(`/param`, { senderid: senderID, index: index }, 5000);
    }

    // 回复文本消息
    this.reply = function (text) {
      return accessLocalService(`/sendText`, { senderid: senderID, text: text }, 5000);
    }

    // 编辑消息
    this.edit = function (text) {
      accessLocalService(`/editText`, { senderid: senderID, text: text }, 5000);
    }

    //回复markdown消息
    this.replyMarkdown = function (markdown) {
      return accessLocalService(`/sendMarkdown`, { senderid: senderID, markdown: markdown }, 5000);
    }

    // 回复图片消息
    this.replyImage = function (imageUrl) {
      return accessLocalService(`/sendImage`, { senderid: senderID, imageurl: imageUrl }, 5000);
    }

    // 回复语音消息
    this.replyVoice = function (voiceUrl) {
      return accessLocalService(`/sendVoice`, { senderid: senderID, voiceurl: voiceUrl }, 5000);
    }

    // 回复视频消息
    this.replyVideo = function (videoUrl) {
      return accessLocalService(`/sendVideo`, { senderid: senderID, videourl: videoUrl }, 5000);
    }

    //等待用户输入
    this.listen = function (timeout) {
      return accessLocalService(`/listen`, { senderid: senderID, timeout: timeout }, timeout);
    }

    //等待用户输入,timeout为超时时间，单位为毫秒,recallDuration为撤回用户输入的延迟时间，单位为毫秒，0是不撤回，forGroup为bool值true或false，是否接收群聊所有成员的输入
    this.input = function (timeout, recallDuration, forGroup) {
      return accessLocalService(`/input`, { senderid: senderID, time: timeout, recallDuration: recallDuration, forGroup: forGroup }, timeout);
    }

    //等待支付
    this.waitPay = function (exitcode, timeout) {
      return accessLocalService(`/waitPay`, { senderid: senderID, exitcode: exitcode, timeout: timeout }, timeout);
    }

    //是否处于等待支付状态
    this.atWaitPay = function () {
      return accessLocalService(`/atWaitPay`, { senderid: senderID }, 5000);
    }

    //邀请入群
    this.groupInviteIn = function (friend, group) {
      accessLocalService(`/groupInviteIn`, { senderid: senderID, friend: friend, group: group }, 5000);
    }

    //踢群
    this.groupKick = function (userid) {
      accessLocalService(`/groupKick`, { senderid: senderID, userid: userid }, 5000);
    }

    //禁言
    this.groupBan = function (userid, timeout) {
      accessLocalService(`/groupBan`, { senderid: senderID, userid: userid, timeout: timeout }, 5000);
    }

    //解除禁言
    this.groupUnban = function (userid) {
      accessLocalService(`/groupUnban`, { senderid: senderID, userid: userid }, 5000);
    }

    //全员禁言
    this.groupWholeBan = function () {
      accessLocalService(`/groupWholeBan`, { senderid: senderID }, 5000);
    }

    //解除全员禁言
    this.groupWholeUnban = function () {
      accessLocalService(`/groupWholeUnban`, { senderid: senderID }, 5000);
    }

    //发送群公告
    this.groupNoticeSend = function (notice) {
      accessLocalService(`/groupNoticeSend`, { senderid: senderID, notice: notice }, 5000);
    }

    //获取当前处理流程的插件名
    this.getPluginName = function () {
      return accessLocalService(`/getPluginName`, { senderid: senderID }, 5000);
    }

    //获取当前处理流程的插件版本
    this.getPluginVersion = function () {
      return accessLocalService(`/getPluginVersion`, { senderid: senderID }, 5000);
    }

  };
}

class Cron {
  constructor() {
    // 获取定时指令集合
    this.getCrons = function () {
      return accessLocalService(`/croncmdsGet`, 5000);
    }
    //获取某个定时指令
    this.getCron = function (id) {
      return accessLocalService(`/croncmdsGet`, { id: id }, 5000);
    }
    //添加定时指令,返回id
    this.addCron = function (cron, cmd, isToSelf, toOthers, memo, disguiseImtype, disguiseGroup, disguiseUser) {
      accessLocalService(`/croncmdsAdd`, { cron: cron, cmd: cmd, isToSelf: isToSelf, toOthers: toOthers, memo: memo, disguiseImtype: disguiseImtype, disguiseGroup: disguiseGroup, disguiseUser: disguiseUser }, 5000);
    }
    //修改定时指令
    this.updateCron = function (id, cron, cmd, isToSelf, toOthers, memo) {
      accessLocalService(`/croncmdsUpd`, { id: id, cron: cron, cmd: cmd, isToSelf: isToSelf, toOthers: toOthers, memo: memo, disguiseImtype: disguiseImtype, disguiseGroup: disguiseGroup, disguiseUser: disguiseUser }, 5000);
    }
    //删除定时指令
    this.delCron = function (id) {
      accessLocalService(`/croncmdsDel`, { id: id }, 5000);
    }
  }
}

module.exports = {
  Sender,
  Cron,
  addMsgListener: addMsgListener,
  getSenderID: getSenderID,
  render: render,
  push: push,
  name: name,
  machineId: machineId,
  version: version,
  get: get,
  set: set,
  del: del,
  bucketGet: bucketGet,
  bucketSet: bucketSet,
  bucketDel: bucketDel,
  bucketKeys: bucketKeys,
  bucketAllKeys: bucketAllKeys,
  bucketAll: bucketAll,
  notifyMasters: notifyMasters,
  coffee: coffee,
  spread: spread,
}
