//[title: cpolar]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable: false] 禁用开关，true表示禁用，false表示可用
//[admin: true] 是否为管理员指令
//[rule: ^cpolar$] 匹配规则，多个规则时向下依次写多个
//[rule: ^Cpolar$] 匹配规则，多个规则时向下依次写多个
//[rule: ^CPOLAR$] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: false]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.0]版本号
//[public: false] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 999] 上架价格
//[description: 关于插件的描述] 使用方法尽量写具体
// [param: {"required":true,"key":"cpolar.host","bool":false,"placeholder":"http://127.0.0.1:9200","name":"地址","desc":""}]
// [param: {"required":true,"key":"cpolar.email","bool":false,"placeholder":"","name":"账号","desc":""}]
// [param: {"required":true,"key":"cpolar.password","bool":false,"placeholder":"","name":"密码","desc":""}]

const middleware = require('./middleware.js');
const axios = require('axios');

const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID)

let host, email, password, token
!(async () => {
    // const is_admin = await s.isAdmin()
    const plugin_name = await s.getPluginName()
    const plugin_version = await s.getPluginVersion()
    // const user_avatar_url = await s.getUserAvatarUrl()
    // const username = await s.bucketGet("cloud", "username")
    // const password = await s.bucketGet("cloud", "password")
    const im = await s.getImtype()
    const user_id = await s.getUserID()
    const user_name = await s.getUserName()
    const group_name = await s.getGroupName()
    const group_id = await s.getChatID()
    const param1 = await s.param(1)
    const param2 = await s.param(2)
    // const param3 = await s.param(3)
    const message = await s.getMessage()
    const message_id = await s.getMessageID()

    host = await middleware.bucketGet(plugin_name, "host")
    email = await middleware.bucketGet(plugin_name, "email")
    password = await middleware.bucketGet(plugin_name, "password")
    token = await middleware.bucketGet(plugin_name, "cpolar_token")

    let info = await api_v1_user_info(token)
        .then(async i => {
            console.debug(i)
            if (i.code) {
                if (i.code == 500) s.reply("令牌错误，尝试获取令牌")
                if (i.code == 50014) s.reply("令牌过期，尝试重新获取令牌")
                if (i.code == 401 || i.code == 500 || 50014) {
                    return await api_v1_user_login(email, password)
                        .then(async o => {
                            if (o.code) {
                                console.log("重新获取令牌失败")
                                return o
                            } else {
                                console.log("重新获取令牌成功")
                                token = o.data.token
                                await middleware.bucketSet(plugin_name, "cpolar_token", token)
                                return await api_v1_user_info(token)
                            }
                        })
                }
                return i
            }
            console.log("令牌登录成功")
            return i
        })
    if (info.code) return s.reply(JSON.stringify(info))

    let tunnels = await api_v1_tunnels(token)
    console.debug(tunnels)

    let context = `${plugin_name} v${plugin_version}\n=========================\n`
    // context += `\n用户：${info.data.name}（${info.data.roles.toString()}）`
    // context += `\n隧道（${tunnels.data.total} 条）：\n`
    context += tunnels.data.items.map((v, i) => {
        let msg = `${v.status == "active" ? "✅" : "❌"}【${i + 1}】${v.name}（${v.publish_tunnels.length}）\n`
        msg += v.publish_tunnels.map((t, y) => {
            return ` ${y < v.publish_tunnels.length - 1 ? "┣" : "┗"} ${t.public_url}`
        }).join("\n")
        return msg
    }).join("\n")

    s.reply(context)
})()

function api_v1_tunnels(token) {
    const url = `${host}/api/v1/tunnels`
    return axios({
        "url": url,
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "zh-CN,zh;q=0.9",
            "authorization": `Bearer ${token}`,
            "cache-control": "no-cache",
            "pragma": "no-cache",
            // "cookie": "_xsrf=2|3fc3549f|98c0c7275665435b755c118d23416a99|1710429699; vue_admin_template_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTI5MzQ3MzAsImlhdCI6MTcxMjc2MTkzMCwiVXNlcklEIjowLCJVc2VybmFtZSI6IiIsIkVtYWlsIjoibG9uZzkycGluZ0B2aXAucXEuY29tIiwiQXBpU2VydmljZVRva2VuIjoiZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmxlSEFpT2pFM01USTVNelEzTXpBc0ltbGhkQ0k2TVRjeE1qYzJNVGt6TUN3aVZYTmxja2xFSWpveE5qQTROekVzSWxWelpYSnVZVzFsSWpvaWFuVnpZbVVpTENKRmJXRnBiQ0k2SW14dmJtYzVNbkJwYm1kQWRtbHdMbkZ4TG1OdmJTSjkuREJBVm1wRm9zUmdtcXNHTmVubHZxMGlrUXlfRG94WlVycEFmYzlCM2plQSJ9.j_B-bkEkRpsbyjxVyLObLy5TseaW_QO5MqQhw1q42Bc; autMan=MTcxMjc2NDg5NnxEWDhFQVFMX2dBQUJFQUVRQUFBbF80QUFBUVp6ZEhKcGJtY01Ed0FOWVhWMGFHVnVkR2xqWVhSbFpBUmliMjlzQWdJQUFRPT18WJki0HP4-8L2_M3dySmcyZcSWRdSH4kNgBIIhWFpEN4=; sidebarStatus=0",
            "Referer": url,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET",
        "responseType": "json"
    }).then(response => {
        return {
            code: response.data.code == 20000 ? 0 : response.data.code,
            message: response.data.code == 20000 ? "success" : "fail",
            data: response.data.data
        }
    }).catch(error => {
        return {
            code: error.response.status,
            message: error.response.statusText,
            data: error.response.data
        }
    })
}

function api_v1_user_login(email, password) {
    const url = `${host}/api/v1/user/login`
    // s.reply(`[${typeof email}]email: ${email}`)
    // s.reply(`[${typeof password}]email: ${password}`)
    return axios({
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json;charset=UTF-8",
            "pragma": "no-cache",
            // "cookie": "_xsrf=2|3fc3549f|98c0c7275665435b755c118d23416a99|1710429699; autMan=MTcxMjc1MjYxNHxEWDhFQVFMX2dBQUJFQUVRQUFBbF80QUFBUVp6ZEhKcGJtY01Ed0FOWVhWMGFHVnVkR2xqWVhSbFpBUmliMjlzQWdJQUFRPT18MEjULGUcw_6FG-z-dBY02gqcO5ZIq6gp-Erut3-6UZs=",
            "Referer": host,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "url": url,
        "method": "POST",
        "data": {
            "email": email,
            "password": password
        },
        "responseType": "json"
    }).then(response => {
        // s.reply(`response: ${JSON.stringify(response.data)}`)
        return {
            code: response.data.code == 20000 ? 0 : response.data.code,
            message: response.data.code == 20000 ? "success" : "fail",
            data: response.data.data ? response.data.data : "登录失败，未知错误"
        }
    }).catch(error => {
        return {
            code: error.response.status,
            message: error.response.statusText,
            data: error.response.data
        }
    })
}

function api_v1_user_info(token) {
    const url = `${host}/api/v1/user/info?token=${token}`
    return axios({
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "zh-CN,zh;q=0.9",
            "authorization": `Bearer ${token}`,
            "cache-control": "no-cache",
            "pragma": "no-cache",
            // "cookie": "_xsrf=2|3fc3549f|98c0c7275665435b755c118d23416a99|1710429699; autMan=MTcxMjc1MjYxNHxEWDhFQVFMX2dBQUJFQUVRQUFBbF80QUFBUVp6ZEhKcGJtY01Ed0FOWVhWMGFHVnVkR2xqWVhSbFpBUmliMjlzQWdJQUFRPT18MEjULGUcw_6FG-z-dBY02gqcO5ZIq6gp-Erut3-6UZs=; vue_admin_template_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTI5Mjk1ODYsImlhdCI6MTcxMjc1Njc4NiwiVXNlcklEIjowLCJVc2VybmFtZSI6IiIsIkVtYWlsIjoibG9uZzkycGluZ0B2aXAucXEuY29tIiwiQXBpU2VydmljZVRva2VuIjoiZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmxlSEFpT2pFM01USTVNamsxT0RZc0ltbGhkQ0k2TVRjeE1qYzFOamM0Tml3aVZYTmxja2xFSWpveE5qQTROekVzSWxWelpYSnVZVzFsSWpvaWFuVnpZbVVpTENKRmJXRnBiQ0k2SW14dmJtYzVNbkJwYm1kQWRtbHdMbkZ4TG1OdmJTSjkuLVNNUURPS1Y3UXFlcEFrN00zUjNHNEJRc1JlbHdUc1FKZTFCa1l5UHhhQSJ9.WpGrAYcDYlM-BOn_c4U0kWBST01YnQo2mueCXJ8aGfg",
            "Referer": host,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "url": url,
        "method": "GET",
        "data": null,
        "responseType": "json"
    }).then(response => {
        return {
            code: response.data.code == 20000 ? 0 : response.data.code,
            message: response.data.code == 20000 ? "success" : "fail",
            data: response.data.data
        }
    }).catch(error => {
        return {
            code: error.response.status,
            message: error.response.statusText,
            data: error.response.data
        }
    })
}
