//[author: jusbe]
//[price_type: 3]
//[title: 云备案]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable:false] 禁用开关，true表示禁用，false表示可用
//[admin: true] 是否为管理员指令
//[rule: ^云备案 (https?:\/\/.+\..+[^\/])$] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: false]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.0]版本号
//[public: true] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: 用于更新自建市场备案地址，如：云备案 https://www.autman.com:8080。配合 cpolar 实现动态更新<br>首发：20240515<br><img src="https://bbs.autman.cn/assets/files/2024-06-24/1719215230-341253-d55af059-fb99-4e6a-b0b9-af0c07c26011.jpg" alt="cpolar" />] 使用方法尽量写具体
//[param: {"required":true,"key":"jusapi.host","bool":false,"placeholder":"http://127.0.0.1:8080","name":"autman 地址","desc":""}]
//[param: {"required":true,"key":"jusapi.username","bool":false,"placeholder":"","name":"autman 账号","desc":""}]
//[param: {"required":true,"key":"jusapi.password","bool":false,"placeholder":"","name":"autman 密码","desc":""}]

const middleware = require('./middleware.js');
const axios = require('axios');
const qs = require('qs');

const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID)

!(async () => {
    const plugin_name = await s.getPluginName()
    const plugin_version = await s.getPluginVersion()
    const param1 = await s.param(1)

    let message = `${plugin_name} v${plugin_version}\n========================`,
        response

    let host = await middleware.bucketGet("jusapi", "host"),
        username = await middleware.bucketGet("jusapi", "username"),
        password = await middleware.bucketGet("jusapi", "password"),
        Cookie = await middleware.bucketGet("jusapi", "Cookie")
    if (!(host && username && password)) return s.reply((message + "\n请设置配参").replace(/^\s+/mg, ""))

    // CK登录
    response = await axios.request({
        method: 'GET',
        url: `${host}/login`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.139 Safari/537.36',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="98"',
            'x-requested-with': 'XMLHttpRequest',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': `${host}/admin/`,
            'accept-language': 'zh-CN,zh;q=0.9',
            'Cookie': Cookie,
        }
    })
        // { code: 200, message: '已登陆', data: { user: 'jusbe' } }
        // {"code":401,"message":"未登陆","data":null}
        .then(response => response.data)
        .catch(error => ({ code: error.response.status, message: error.response.statusText }));

    // 账号登录
    if (response.code !== 200) response = await axios.request({
        method: 'POST',
        url: `${host}/login`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.139 Safari/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/x-www-form-urlencoded',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="98"',
            'x-requested-with': 'XMLHttpRequest',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'origin': host,
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': `${host}/admin/aut_pages_login.html?t=${Date.now()}`,
            'accept-language': 'zh-CN,zh;q=0.9',
        },
        data: qs.stringify({
            'username': username,
            'password': password
        })
    })
        // {"code":200,"message":"登陆成功","data":null}
        // {"code":401,"message":"账号或密码错误","data":null}
        .then(response => {
            if (response.data.code === 200) {
                Cookie = response.headers["set-cookie"].join("; ")
                middleware.bucketSet("jusapi", "Cookie", Cookie)
            }
            return response.data
        })
        .catch(error => ({ code: error.response.status, message: error.response.statusText }));
    message += "\n登录: " + response.message
    if (response.code !== 200) return s.reply(message.replace(/^\s+/mg, ""))

    // 云备案
    response = await axios.request({
        method: 'POST',
        url: `${param1}/market/record`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.139 Safari/537.36',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="98"',
            'x-requested-with': 'XMLHttpRequest',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'origin': param1,
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': `${param1}/admin/aut_market_cfg.html`,
            'accept-language': 'zh-CN,zh;q=0.9',
            'Cookie': Cookie
        }
    })
        // { code: 200, message: '备案成功', data: null }
        .then(response => response.data)
        .catch(error => ({ code: error.response.status, message: error.response.statusText }));
    message += "\n云备案: " + response.message
    message += `\n地址: ${param1}`

    s.reply(message.replace(/^\s+/mg, ""))
})()
