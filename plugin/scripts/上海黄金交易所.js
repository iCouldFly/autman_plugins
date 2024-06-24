//[author: jusbe]
//[title: 上海黄金交易所]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable: false] 禁用开关，true表示禁用，false表示可用
//[admin: true] 是否为管理员指令
//[rule: ^上海黄金$] 匹配规则，多个规则时向下依次写多个
//[rule: ^金价$] 匹配规则，多个规则时向下依次写多个
//[rule: ^银价$] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: false]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.0]版本号
//[public: true] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: 查询上海黄金交易所金/银价<br>自行设置 定时推送<br>首发：20240402<br><img src="https://bbs.autman.cn/assets/files/2024-06-24/1719216188-933168-5ab8767c-91ec-4de9-9b75-f373ddadcd35.jpg" alt="上海黄金交易所" />] 使用方法尽量写具体

const middleware = require('./middleware.js');
const axios = require('axios');
const cheerio = require('cheerio');

const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID)

!(async () => {
    const response = await axios.get('https://www.sge.com.cn/ico');
    const $ = cheerio.load(response.data);
    const targetDiv0 = $('#dataStatistics0.content');
    const targetDiv1 = $('#dataStatistics1.content');
    const childDivs0 = targetDiv0.find('div');
    const childDivs1 = targetDiv1.find('div');
    const msg0=$(childDivs0[0]).text().replace(/\s\s+/g,"\n")
    const msg1=$(childDivs1[0]).text().replace(/\s\s+/g,"\n")
    console.log(`${msg0}\n========================\n${msg1}`)

    await s.reply(`${msg0}\n========================\n${msg1}`)
})()
