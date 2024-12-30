const axios = require('axios');
axios.defaults.baseURL = "http://localhost:8080/otto";

/** 获取本地服务响应
 * @param {string} path 本地服务路由
 * @param {number} timeout 超时时间
 */
const accessLocalService = (path, body = null, timeout = 5000) =>
  axios.post(path, body, { headers: { 'Content-Type': 'application/json' }, timeout: timeout })
    .then(({ status, statusText, headers, config, request, data }) => data?.data)
    .catch(({ message, name, code, config, request, response }) => new Error({ path, name, code, message }));

/**
 * 消息监听函数和回调函数
 * @param {string} imtype 消息类型
 * @param {string} chatid 群组ID
 * @param {string} userid 用户ID
 * @param {function} callback 回调函数
 */
const addMsgListener = (imtype, chatid, userid, callback) => {
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
const getSenderID = () => console.log(process.argv) || process.argv[1];

/** 渲染html
 * @param {string} template swig 格式 html 模板
 * @param {string} selector css选择器
 * @param {object} data 输入数据
 * @returns {string} base64格式图片数据
 */
const render = (template, selector, data) =>
  accessLocalService(
    `/render`,
    {
      file: "",//使用内置模板时
      source: template,//使用自定义模板时填写代码
      selector: selector,//选择器，即渲染哪部分
      data: data//数据
    },
    5000
  );

// 推送消息
const push = (imType, groupCode, userID, title, content) =>
  accessLocalService(`/push`,
    {
      imType: imType,
      groupCode: groupCode,
      userID: userID,
      title: title ?? "",
      content: content,
    },
    5000
  );

// 获取机器人名称
const name = () => accessLocalService(`/name`);

// 获取机器id
const machineId = () => accessLocalService(`/machineId`);

// 获取机器人版本
const version = () => accessLocalService(`/version`);

// 获取数据库数据
const get = (key) => accessLocalService(`/get`, { key: key });

// 设置数据库数据
const set = (key, value) => accessLocalService(`/set`, { key: key, value: value });

// 删除数据库数据
const del = (key) => accessLocalService(`/del`, { key: key });

// 获取指定数据库指定的key值
const bucketGet = (bucket, key) => accessLocalService(`/bucketGet`, { bucket: bucket, key: key });

// 设置指定数据库指定的key值
const bucketSet = (bucket, key, value) => accessLocalService(`/bucketSet`, { bucket: bucket, key: key, value: value });

// 删除指定数据库指定key的值
const bucketDel = (bucket, key) => accessLocalService(`/bucketDel`, { bucket: bucket, key: key });

// 获取指定数据库所有值为value的keys
const bucketKeys = (bucket, value) => accessLocalService(`/bucketKeys`, { bucket: bucket, value: value });

// 获取指定数据桶内所有的key集合
const bucketAllKeys = (bucket) => accessLocalService(`/bucketAllKeys`, { bucket: bucket });

// 获取指定数据桶内所有的key value集合
const bucketAll = (bucket) => accessLocalService(`/bucketAll`, { bucket: bucket });

// 通知管理员
const notifyMasters = (content, imtypes = []) => accessLocalService(`/notifyMasters`, { content: content, imtypes: imtypes });

// 当前系统咖啡码激活状态
const coffee = () => accessLocalService(`/coffee`);

// 京东、淘宝、拼多多转链推广
const spread = (msg) => accessLocalService(`/spread`, { msg: msg });

class Sender {
  constructor(senderID) {
    // 发送者ID,格式：in64时间戳,
    this.senderID = senderID;

    // 获取指定数据库指定的key值
    this.bucketGet = (bucket, key) => accessLocalService(`/bucketGet`, { senderid: senderID, bucket: bucket, key: key });

    // 设置指定数据库指定的key值
    this.bucketSet = (bucket, key, value) => accessLocalService(`/bucketSet`, { senderid: senderID, bucket: bucket, key: key, value: value });

    // 删除指定数据库指定key的值
    this.bucketDel = (bucket, key) => accessLocalService(`/bucketDel`, { senderid: senderID, bucket: bucket, key: key });

    // 获取指定数据库所有值为value的keys
    this.bucketKeys = (bucket, value) => accessLocalService(`/bucketKeys`, { senderid: senderID, bucket: bucket, value: value });

    // 获取指定数据桶内所有的key集合
    this.bucketAllKeys = (bucket) => accessLocalService(`/bucketAllKeys`, { senderid: senderID, bucket: bucket });

    // 获取指定数据桶内所有的key value集合
    this.bucketAll = (bucket) => accessLocalService(`/bucketAll`, { senderid: senderID, bucket: bucket });

    this.setContinue = () => accessLocalService(`/continue`, { senderid: senderID });

    // 路由路径
    this.getRouterPath = () => accessLocalService(`/getRouterPath`, { senderid: senderID });

    // 路由参数
    this.getRouterParams = () => accessLocalService(`/getRouterParams`, { senderid: senderID });

    // 路由方法
    this.getRouterMethod = () => accessLocalService(`/getRouterMethod`, { senderid: senderID });

    // 路由请求头
    this.getRouterHeaders = () => accessLocalService(`/getRouterHeaders`, { senderid: senderID });

    // 路由cookies
    this.getRouterCookies = () => accessLocalService(`/getRouterCookies`, { senderid: senderID });

    // 路由请求体
    this.getRouterBody = () => accessLocalService(`/getRouterBody`, { senderid: senderID });

    // 获取发送者渠道
    this.getImtype = () => accessLocalService(`/getImtype`, { senderid: senderID });

    /** 获取当前用户id
     * @returns {string} 注意：这里是base64编码后的userid
     */
    this.getUserID = () => accessLocalService(`/getUserID`, { senderid: senderID });

    // 获取当前用户名
    this.getUserName = () => accessLocalService(`/getUserName`, { senderid: senderID });

    // 获取用户头像url
    this.getUserAvatarUrl = () => accessLocalService(`/getUserAvatarUrl`, { senderid: senderID });

    // 获取当前群组id
    this.getChatID = () => accessLocalService(`/getChatID`, { senderid: senderID });

    // 获取当前群组名称
    this.getGroupName = () => accessLocalService(`/getGroupName`, { senderid: senderID });

    // 是否管理员
    this.isAdmin = () => accessLocalService(`/isAdmin`, { senderid: senderID });

    // 获取消息
    this.getMessage = () => accessLocalService(`/getMessage`, { senderid: senderID });

    // 获取消息ID
    this.getMessageID = () => accessLocalService(`/getMessageID`, { senderid: senderID });

    // 获取历史消息ids
    this.getHistoryMessageIDs = (number) => accessLocalService(`/getHistory`, { senderid: senderID, number: number });

    // 撤回消息
    this.recallMessage = (messageid) => accessLocalService(`/recallMessage`, { senderid: senderID, messageid: messageid });

    // 模拟新消息输入，即将消息发送者的消息修改为新的内容，重新送往autMan内部处理
    this.breakIn = (content) => accessLocalService(`/breakIn`, { senderid: senderID, content: content });

    // 获取匹配的文本参数
    this.param = (index) => accessLocalService(`/param`, { senderid: senderID, index: index });

    // 回复文本消息
    this.reply = (text) => accessLocalService(`/sendText`, { senderid: senderID, text: typeof text === 'string' ? text : JSON.stringify(text) });

    // 编辑消息
    this.edit = (text) => accessLocalService(`/editText`, { senderid: senderID, text: text });

    //回复markdown消息
    this.replyMarkdown = (markdown) => accessLocalService(`/sendMarkdown`, { senderid: senderID, markdown: markdown });

    // 回复图片消息
    this.replyImage = (imageUrl) => accessLocalService(`/sendImage`, { senderid: senderID, imageurl: imageUrl });

    // 回复语音消息
    this.replyVoice = (voiceUrl) => accessLocalService(`/sendVoice`, { senderid: senderID, voiceurl: voiceUrl });

    // 回复视频消息
    this.replyVideo = (videoUrl) => accessLocalService(`/sendVideo`, { senderid: senderID, videourl: videoUrl });

    //等待用户输入
    this.listen = (timeout) => accessLocalService(`/listen`, { senderid: senderID, timeout: timeout }, timeout);

    //等待用户输入,timeout为超时时间，单位为毫秒,recallDuration为撤回用户输入的延迟时间，单位为毫秒，0是不撤回，forGroup为bool值true或false，是否接收群聊所有成员的输入
    this.input = (timeout, recallDuration, forGroup) => accessLocalService(
      `/input`,
      {
        senderid: senderID,
        time: timeout,
        recallDuration: recallDuration,
        forGroup: forGroup
      },
      timeout
    );

    //等待支付
    this.waitPay = (exitcode, timeout) => accessLocalService(`/waitPay`, { senderid: senderID, exitcode: exitcode, timeout: timeout }, timeout);

    //是否处于等待支付状态
    this.atWaitPay = () => accessLocalService(`/atWaitPay`, { senderid: senderID });

    //邀请入群
    this.groupInviteIn = (friend, group) => accessLocalService(`/groupInviteIn`, { senderid: senderID, friend: friend, group: group });

    //踢群
    this.groupKick = (userid) => accessLocalService(`/groupKick`, { senderid: senderID, userid: userid });

    //禁言
    this.groupBan = (userid, timeout) => accessLocalService(`/groupBan`, { senderid: senderID, userid: userid, timeout: timeout });

    //解除禁言
    this.groupUnban = (userid) => accessLocalService(`/groupUnban`, { senderid: senderID, userid: userid });

    //全员禁言
    this.groupWholeBan = () => accessLocalService(`/groupWholeBan`, { senderid: senderID });

    //解除全员禁言
    this.groupWholeUnban = () => accessLocalService(`/groupWholeUnban`, { senderid: senderID });

    //发送群公告
    this.groupNoticeSend = (notice) => accessLocalService(`/groupNoticeSend`, { senderid: senderID, notice: notice });

    //获取当前处理流程的插件名
    this.getPluginName = () => accessLocalService(`/getPluginName`, { senderid: senderID });

    //获取当前处理流程的插件版本
    this.getPluginVersion = () => accessLocalService(`/getPluginVersion`, { senderid: senderID });

  };
}

class Cron {
  constructor() {
    // 获取定时指令集合
    this.getCrons = () => accessLocalService(`/croncmdsGet`);
    //获取某个定时指令
    this.getCron = (id) => accessLocalService(`/croncmdsGet`, { id: id });
    //添加定时指令,返回id
    this.addCron = (cron, cmd, isToSelf, toOthers, memo, disguiseImtype, disguiseGroup, disguiseUser) => accessLocalService(`/croncmdsAdd`, { cron: cron, cmd: cmd, isToSelf: isToSelf, toOthers: toOthers, memo: memo, disguiseImtype: disguiseImtype, disguiseGroup: disguiseGroup, disguiseUser: disguiseUser });
    //修改定时指令
    this.updateCron = (id, cron, cmd, isToSelf, toOthers, memo) => accessLocalService(`/croncmdsUpd`, { id: id, cron: cron, cmd: cmd, isToSelf: isToSelf, toOthers: toOthers, memo: memo, disguiseImtype: disguiseImtype, disguiseGroup: disguiseGroup, disguiseUser: disguiseUser });
    //删除定时指令
    this.delCron = (id) => accessLocalService(`/croncmdsDel`, { id: id });
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
