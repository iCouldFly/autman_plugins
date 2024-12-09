//[author: jusbe]
//[price_type: 1]
//[title: 飞书订阅]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable:false] 禁用开关，true表示禁用，false表示可用
//[admin: true] 是否为管理员指令
//[rule: ^飞书订阅 (https?:\/\/.+\..+[^\/])$] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: true]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.1.0 增加输出控制台链接]版本号
//[public: true] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: 用于更新飞书订阅方式请求地址，如：飞书订阅 https://www.autman.com:8080。配合 cpolar 实现动态更新<br>首发：20240629<br><img src="https://bbs.autman.cn/assets/files/2024-07-01/1719799198-543594-92dba2d8-48f1-4830-a696-35f78228cb56.jpg" alt="飞书订阅" />] 使用方法尽量写具体
//[param: {"required":true,"key":"fs.app_id","bool":false,"placeholder":"如: cli_a2134123r651423rc","name":"app_id","desc":""}]
//[param: {"required":true,"key":"fs.x_csrf_token","bool":false,"placeholder":"","name":"x-csrf-token","desc":""}]
//[param: {"required":true,"key":"fs.cookie","bool":false,"placeholder":"","name":"cookie","desc":""}]
//[param: {"required":true,"key":"fs.verification_token","bool":false,"placeholder":"","name":"verificationToken","desc":""}]
//[param: {"required":true,"key":"fs.event_encrypt_key","bool":false,"placeholder":"","name":"encryptKey","desc":""}]

const axios = require('axios');

const middleware = require('./middleware.js');
const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID)

!(async () => {
    const plugin_name = await s.getPluginName()
    const plugin_version = await s.getPluginVersion()
    const param1 = await s.param(1)

    let app_id = await middleware.bucketGet("fs", "app_id"),
        x_csrf_token = await middleware.bucketGet("fs", "x_csrf_token"),
        cookie = await middleware.bucketGet("fs", "cookie"),
        verificationUrl = `${param1}/fs/receive`,
        verificationToken = await middleware.bucketGet("fs", "verification_token"),
        encryptKey = await middleware.bucketGet("fs", "event_encrypt_key"),
        message = `${plugin_name} v${plugin_version.split(" ")[0]}\n========================\nAPP ID: ${app_id}\n请求地址: ${verificationUrl}\n控制台: https://open.feishu.cn/app/${app_id}/event\n`,
        response
    if (!(app_id && x_csrf_token && cookie && verificationUrl && verificationToken && encryptKey)) return s.reply(message + "❌ 请检测“插件配参”及“系统配置”")

    // 测试、修改回调地址✅❌
    response = await axios.request({
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://open.feishu.cn/developers/v1/event/check_url/${app_id}`,
        headers: {
            'authority': 'open.feishu.cn',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="98"',
            'x-timezone-offset': '-480',
            'content-type': 'application/json',
            'x-csrf-token': x_csrf_token,
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.139 Safari/537.36',
            'sec-ch-ua-platform': '"Windows"',
            'accept': '*/*',
            'origin': 'https://open.feishu.cn',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': `https://open.feishu.cn/app/${app_id}/event`,
            'accept-language': 'zh-CN,zh;q=0.9',
            'cookie': cookie,
        },
        data: JSON.stringify({
            "verificationToken": verificationToken,
            "verificationUrl": verificationUrl,
            "encryptKey": encryptKey
        })
    })
        // 成功: {"code":0,"data":{"Head":{"RespFormat":0},"access":true,"msg":""},"msg":""}
        // verificationUrl 错误: {"code":0,"data":{"Head":{"RespFormat":0},"access":false,"msg":"url invalid"},"msg":""}
        // verificationToken 错误: {"code":0,"data":{"Head":{"RespFormat":0},"access":false,"msg":"Challenge code没有返回"},"msg":""}
        // encryptKey 错误: {"code":0,"data":{"Head":{"RespFormat":0},"access":false,"msg":"Challenge code没有返回"},"msg":""}
        // console.log(JSON.stringify(response.data));
        .then(({ data: { data: { code, data, access, msg } } } = response) => ({ code: code, message: msg, success: access, data: data }))
        .catch(({ message, name, code, status } = error) => ({ code: status, message: `[${name}]${code} - ${message}`, success: false, data: error }));
    if (!response.success) return s.reply(message + "❌ " + response.message)
    message += "✅ 回调地址设置成功\n"

    // 获取机器人信息
    response = await axios.request({
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://open.feishu.cn/developers/v1/app/${app_id}`,
        headers: {
            'authority': 'open.feishu.cn',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="98"',
            'x-timezone-offset': '-480',
            'content-type': 'application/json',
            'x-csrf-token': x_csrf_token,
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.139 Safari/537.36',
            'sec-ch-ua-platform': '"Windows"',
            'accept': '*/*',
            'origin': 'https://open.feishu.cn',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': `https://open.feishu.cn/app/${app_id}/event`,
            'accept-language': 'zh-CN,zh;q=0.9',
            'cookie': cookie
        },
        data: JSON.stringify({})
    })
        // {"code":0,"data":{"Head":{"RespFormat":0},"ability":["bot"],"appListStatus":2,"appSceneType":0,"appStatus":1,"appType":8,"auditStatus":100,"auditVersionId":"7347375219693256707","avatar":"https://s3-imfile.feishucdn.com/static-resource/v1/v3_0080_52daa33a-af17-40ac-b5a8-c015be7ee01g","canCompanyTest":true,"clientID":"cli_a5438dbbfd78d00c","desc":"奥特","homePage":"","i18n":{"zh_cn":{"description":"奥特","help_use":"","name":"autbot"}},"isDefaultAvatar":false,"isHideVisibility":false,"isTestApp":false,"langs":["zh_cn"],"menuAbility":["bot"],"name":"autbot","primaryLang":"zh_cn","specialTag":0,"tenantAppStatus":2,"updateStatus":0},"msg":""}
        .then(({ data: { code, data, message } } = response) => ({ code: code, message: message, success: !code, data: data }))
        .catch((error) => {
            console.log(error);
        });
    if (!response.success) return s.reply(message + "❌ " + response.message)
    message += `机器人: ${response.data.name}\n描述: ${response.data.desc}\n[CQ:image,file=${response.data.avatar}]`

    // 输出信息
    s.reply(message)
})()
