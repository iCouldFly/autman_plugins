const http = require('http');
const socketPath = '/tmp/autMan.sock';

/**
 * 获取本地服务响应
 * @param {string} path 本地服务路由
 * @param {object} body 请求体
 * @param {number} timeout 超时时间（毫秒）
 * @returns {Promise<any>} 返回服务响应的 data 字段
 */
const accessSockService = (path, body = null, timeout = 5000) =>
  new Promise((resolve, reject) => {
    const options = {
      socketPath: socketPath,
      path: `/sock${path}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout
    };

    const req = http.request(options, (res) => {
      res.setEncoding('utf8');
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const data = JSON.parse(responseData);
          resolve(data?.data);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('timeout', () => {
      const timeoutError = new Error(`Request timed out after ${timeout}ms`);
      timeoutError.code = 'ETIMEOUT'; // 自定义错误码
      reject(timeoutError);
    })

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(body));
    req.end();
  })
    .catch(error => {
      console.error(`Request error [${path}]:`, error.name, error.code, error.message);
      throw error;
    });

module.exports = class middleware {
  // 获取发送者ID
  static getSenderID = () => console.log(process.argv) || process.argv[1];

  /** 渲染html
   * @param {string} template swig 格式 html 模板
   * @param {string} selector css选择器
   * @param {object} data 输入数据
   * @returns {string} base64格式图片数据
   */
  static render = (template, selector, data) =>
    accessSockService(
      `/render`,
      {
        file: "",//使用内置模板时
        source: template,//使用自定义模板时填写代码
        selector: selector,//选择器，即渲染哪部分
        data: data//数据
      }
    );

  // 获取激活的imtypes
  static getActiveImtypes = () => accessSockService(`/getActiveImtypes`);

  // 推送消息
  static push = (imType, groupCode, userID, title, content) =>
    accessSockService(`/push`,
      {
        imType: imType,
        groupCode: groupCode,
        userID,
        title: title ?? "",
        content,
      }
    );

  // 获取机器人名称
  static name = () => accessSockService(`/name`);

  // 获取机器人域名或公网地址
  static domain = () => accessSockService(`/domain`);

  // 获取autMan内置端口
  static port = () => accessSockService(`/port`);

  // 获取机器id
  static machineId = () => accessSockService(`/machineId`);

  // 获取机器人版本
  static version = () => accessSockService(`/version`);

  // 获取数据库数据
  static get = (key) => accessSockService(`/get`, { key });

  // 设置数据库数据
  static set = (key, value) => accessSockService(`/set`, { key, value });

  // 删除数据库数据
  static del = (key) => accessSockService(`/del`, { key });

  // 获取指定数据库指定的key值
  static bucketGet = (bucket, key) => accessSockService(`/bucketGet`, { bucket, key });

  // 设置指定数据库指定的key值
  static bucketSet = (bucket, key, value) => accessSockService(`/bucketSet`, { bucket, key, value });

  // 删除指定数据库指定key的值
  static bucketDel = (bucket, key) => accessSockService(`/bucketDel`, { bucket, key });

  // 获取指定数据库所有值为value的keys
  static bucketKeys = (bucket, value) => accessSockService(`/bucketKeys`, { bucket, value });

  // 获取指定数据桶内所有的key集合
  static bucketAllKeys = (bucket) => accessSockService(`/bucketAllKeys`, { bucket });

  // 获取指定数据桶内所有的key value集合
  static bucketAll = (bucket) => accessSockService(`/bucketAll`, { bucket });

  // 通知管理员
  static notifyMasters = (content, imtypes = []) => accessSockService(`/notifyMasters`, { content, imtypes });

  // 当前系统咖啡码激活状态
  static coffee = () => accessSockService(`/coffee`);

  // 京东、淘宝、拼多多转链推广
  static spread = (msg) => accessSockService(`/spread`, { msg });

  //获取历史消息 最多近100条消息
  static getHistoryMessages = (imtype) => accessSockService(`/getHistoryMessages`, { imtype });

  static Sender = class Sender {
    constructor(senderid) {

      // 发送者ID,格式：in64时间戳,
      this.senderID = senderid;

      // 获取指定数据库指定的key值
      this.bucketGet = (bucket, key) => accessSockService(`/bucketGet`, { senderid, bucket, key });

      // 设置指定数据库指定的key值
      this.bucketSet = (bucket, key, value) => accessSockService(`/bucketSet`, { senderid, bucket, key, value });

      // 删除指定数据库指定key的值
      this.bucketDel = (bucket, key) => accessSockService(`/bucketDel`, { senderid, bucket, key });

      // 获取指定数据库所有值为value的keys
      this.bucketKeys = (bucket, value) => accessSockService(`/bucketKeys`, { senderid, bucket, value });

      // 获取指定数据桶内所有的key集合
      this.bucketAllKeys = (bucket) => accessSockService(`/bucketAllKeys`, { senderid, bucket });

      // 获取指定数据桶内所有的key value集合
      this.bucketAll = (bucket) => accessSockService(`/bucketAll`, { senderid, bucket });

      this.setContinue = () => accessSockService(`/continue`, { senderid });

      // 路由路径
      this.getRouterPath = () => accessSockService(`/getRouterPath`, { senderid });

      // 路由参数
      this.getRouterParams = () => accessSockService(`/getRouterParams`, { senderid });

      // 路由方法
      this.getRouterMethod = () => accessSockService(`/getRouterMethod`, { senderid });

      // 路由请求头
      this.getRouterHeaders = () => accessSockService(`/getRouterHeaders`, { senderid });

      // 路由cookies
      this.getRouterCookies = () => accessSockService(`/getRouterCookies`, { senderid });

      // 路由请求体
      this.getRouterBody = () => accessSockService(`/getRouterBody`, { senderid });

      // 路由响应
      this.response = () => accessSockService(`/response`, { senderid });

      // 获取发送者渠道
      this.getImtype = () => accessSockService(`/getImtype`, { senderid });

      /** 获取当前用户id
       * @returns {string} 注意：这里是base64编码后的userid
       */
      this.getUserID = () => accessSockService(`/getUserID`, { senderid });

      // 获取当前用户名
      this.getUserName = () => accessSockService(`/getUserName`, { senderid });

      // 获取用户头像url
      this.getUserAvatarUrl = () => accessSockService(`/getUserAvatarUrl`, { senderid });

      // 获取当前群组id
      this.getChatID = () => accessSockService(`/getChatID`, { senderid });

      // 获取当前群组名称
      this.getGroupName = () => accessSockService(`/getGroupName`, { senderid });

      // 是否管理员
      this.isAdmin = () => accessSockService(`/isAdmin`, { senderid });

      // 获取消息
      this.getMessage = () => accessSockService(`/getMessage`, { senderid });

      // 获取消息ID
      this.getMessageID = () => accessSockService(`/getMessageID`, { senderid });

      // 获取历史消息ids
      this.getHistoryMessageIDs = (number) => accessSockService(`/getHistory`, { senderid, number });

      // 撤回消息
      this.recallMessage = (messageid) => accessSockService(`/recallMessage`, { senderid, messageid });

      // 模拟新消息输入，即将消息发送者的消息修改为新的内容，重新送往autMan内部处理
      this.breakIn = (content) => accessSockService(`/breakIn`, { senderid, content });

      // 获取匹配的文本参数
      this.param = (index) => accessSockService(`/param`, { senderid, index });

      // 回复文本消息
      this.reply = (text) => accessSockService(`/sendText`, { senderid, text: typeof text === 'string' ? text : JSON.stringify(text) });

      // 编辑消息
      this.edit = (text) => accessSockService(`/editText`, { senderid, text });

      //回复markdown消息
      this.replyMarkdown = (markdown) => accessSockService(`/sendMarkdown`, { senderid, markdown });

      // 回复图片消息
      this.replyImage = (imageurl) => accessSockService(`/sendImage`, { senderid, imageurl });

      // 回复语音消息
      this.replyVoice = (voiceurl) => accessSockService(`/sendVoice`, { senderid, voiceurl });

      // 回复视频消息
      this.replyVideo = (videourl) => accessSockService(`/sendVideo`, { senderid, videourl });

      //等待用户输入
      this.listen = (timeout) => accessSockService(`/listen`, { senderid, timeout }, timeout);

      //等待用户输入,timeout为超时时间，单位为毫秒,recallDuration为撤回用户输入的延迟时间，单位为毫秒，0是不撤回，forGroup为bool值true或false，是否接收群聊所有成员的输入
      this.input = (time, recallDuration, forGroup) => accessSockService(
        `/input`,
        {
          senderid,
          time,
          recallDuration,
          forGroup
        },
        time
      );

      //等待支付
      this.waitPay = (exitcode, timeout) => accessSockService(`/waitPay`, { senderid, exitcode, timeout }, timeout);

      //是否处于等待支付状态
      this.atWaitPay = () => accessSockService(`/atWaitPay`, { senderid });

      //邀请入群
      this.groupInviteIn = (friend, group) => accessSockService(`/groupInviteIn`, { senderid, friend, group });

      //踢群
      this.groupKick = (userid) => accessSockService(`/groupKick`, { senderid, userid });

      //禁言
      this.groupBan = (userid, timeout) => accessSockService(`/groupBan`, { senderid, userid, timeout });

      //解除禁言
      this.groupUnban = (userid) => accessSockService(`/groupUnban`, { senderid, userid });

      //全员禁言
      this.groupWholeBan = () => accessSockService(`/groupWholeBan`, { senderid });

      //解除全员禁言
      this.groupWholeUnban = () => accessSockService(`/groupWholeUnban`, { senderid });

      //发送群公告
      this.groupNoticeSend = (notice) => accessSockService(`/groupNoticeSend`, { senderid, notice });

      //获取当前处理流程的插件名
      this.getPluginName = () => accessSockService(`/getPluginName`, { senderid });

      //获取当前处理流程的插件版本
      this.getPluginVersion = () => accessSockService(`/getPluginVersion`, { senderid });
    };
  }

  static Cron = class Cron {
    constructor() {

      // 获取定时指令集合
      this.getCrons = () => accessSockService(`/croncmdsGet`);

      //获取某个定时指令
      this.getCron = (id) => accessSockService(`/croncmdsGet`, { id });

      //添加定时指令,返回id
      this.addCron = (cron, cmd, isToSelf, toOthers, memo, disguiseImtype, disguiseGroup, disguiseUser) => accessSockService(`/croncmdsAdd`, { cron, cmd, isToSelf, toOthers, memo, disguiseImtype, disguiseGroup, disguiseUser });

      //修改定时指令
      this.updateCron = (id, cron, cmd, isToSelf, toOthers, memo) => accessSockService(`/croncmdsUpd`, { id, cron, cmd, isToSelf, toOthers, memo, disguiseImtype, disguiseGroup, disguiseUser });

      //删除定时指令
      this.delCron = (id) => accessSockService(`/croncmdsDel`, { id });
    };
  };
};