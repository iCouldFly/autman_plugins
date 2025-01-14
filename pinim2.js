//[author: jusbe]
//[title: pinim2]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable: false] 禁用开关，true表示禁用，false表示可用
//[admin: true] 是否为管理员指令
//[rule: ^pinim2$]
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: true]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.0]版本号
//[public: true] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: 说明》复制 pinWX 到 pinGW，开源，其他平台自己改<br>命令》pinim2 （可自定义）<br><br>首发》20250114] 

const middleware = require('./middleware.js');
const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID);
(async () => { for (const key of await s.bucketAllKeys('pinWX')) s.bucketSet('pinGW', key, await s.bucketGet('pinWX', key)) })()
