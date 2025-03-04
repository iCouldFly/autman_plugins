//[author: jusbe]
//[title: 密码登录]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable:true] 禁用开关，true表示禁用，false表示可用
//[admin: false] 是否为管理员指令
//[rule: raw ^(密码|账密)(登录|检测)$] 匹配规则，多个规则时向下依次写多个
//[cron: 33 */6 * * *] cron定时，支持5位域和6位域
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: false]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.0 ]版本号
//[public: false] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: 命令：密码登录(可自定义)] 
// [param: {"required":true,"key":"autologin.host","bool":false,"placeholder":"http://127.0.0.1:12345","name":"接口地址","desc":""}]
// [param: {"required":false,"key":"autologin.notifies","bool":false,"placeholder":"qqindiv:123,wxgroup:456...","name":"通知目标","desc":"未设置此项将私聊推送结果"}]

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const middleware = require('./middleware.js');
const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID)

try {
    console.log(`加载 ${path.resolve("./jusapi.js")}`)
    var jusapi = require('./jusapi.js');
} catch (e) {
    // error: {code,message,stack,requireStack}
    console.error(e.message)
    if (e.message?.includes?.("Cannot find module './jusapi.js'")) {
        s.reply(`未找到 ${path.resolve("./jusapi.js")}, 尝试下载`)
            .then(() => {
                axios.get("https://raw.githubusercontent.com/iCouldFly/autman_plugins/scripts/jusapi.js", { responseType: 'stream' })
                    .then(({ status, statusText, headers, config, request, data }) => {
                        console.log(`jusapi 下载成功: ${status} - ${statusText}`)
                        const fileStream = fs.createWriteStream('./jusapi.js')
                        data.pipe(fileStream);

                        fileStream.on('finish', () => {
                            fileStream.close();
                            console.log(`jusapi 已保存到: ${path.resolve("./jusapi.js")}`);
                            s.reply("下载完成, 请重新发起命令").then(() => process.exit())
                        });
                    })
                    .catch(({ code, message, stack, name, config, request, constructor, toJSON }) => {
                        console.error(`jusapi 下载失败: [${name}]${code} - ${message}\n \n请手动下载文件并存放至: ${path.resolve("./jusapi.js")}\n\nhttps://raw.githubusercontent.com/iCouldFly/autman_plugins/scripts/jusapi.js`)
                        s.reply(`jusapi 下载失败: ${message}\n \n请手动下载文件并存放至: ${path.resolve("./jusapi.js")}\n\nhttps://raw.githubusercontent.com/iCouldFly/autman_plugins/scripts/jusapi.js`).then(() => process.exit())
                    })
            })
    } else s.reply(e.message.split("\n")[0]).then(() => process.exit())
}

jusapi &&
    !(async () => {
        const is_admin = await s.isAdmin()
        const admin_icon = is_admin ? "🐮" : "👤"
        const plugin_name = await s.getPluginName()
        const plugin_version = (await s.getPluginVersion()).match(/^[\d\.]+/)[0]
        const separator = (await middleware.bucketGet("fcbox", "separator")) || "="
        const separator_width = (await middleware.bucketGet("fcbox", "separator_width")) || 23
        const title = `${admin_icon} ${plugin_name} v${plugin_version}\n${separator.repeat(separator_width)}`
        // const user_avatar_url = await s.getUserAvatarUrl()
        // const username = await s.bucketGet("cloud", "username")
        // const password = await s.bucketGet("cloud", "password")
        const im = await s.getImtype()
        const user_id = await s.getUserID()
        // const user_name = await s.getUserName()
        // const group_name = await s.getGroupName()
        // const group_id = await s.getChatID()
        // const param1 = await s.param(1)
        // const param2 = await s.param(2)
        // const param3 = await s.param(3)
        const message = await s.getMessage()
        // const message_id = await s.getMessageID()
        const { inputReg, rebug, sleep, getQLS, QingLong, sendNotify } = jusapi
        console.log(im)
        let try_time = 60, wait_time = 5
        const host = await middleware.bucketGet("autologin", "host"); host || (await s.reply("未设置: host"), process.exit())
        const users = JSON.parse((await middleware.bucketGet("autologin", "users")) || "[]")
        // const ql_name = await middleware.bucketGet("autologin", "ql"); ql_name || (await s.reply("未设置: 容器名称"), process.exit())
        // const ql_cfg = await getQLS(ql_name); ql_cfg.success || (await s.reply(ql_cfg.message), process.exit())
        // const ql = await new QingLong(ql_cfg.data?.[0]); ql.success || (await s.reply(ql.message || `容器连接失败: ${ql_name}`), process.exit())

        const _axios = (option) =>
            axios({ ...{ method: "post" }, ...option })
                .then(({ status, statusText, headers, config, request, data }) =>
                    rebug(`【${new URL(config.url).pathname}】${data.status || status}: ${data.msg || statusText} --> ${JSON.stringify(data)}`, true, data.status || status, data, data.msg || statusText))
                .catch(({ message, name, code, response: { status, statusText, headers, config, request, data } }) =>
                    rebug(`【${new URL(config.url).pathname}】[${name}]${status || code}: ${statusText || message} --> ${JSON.stringify(data)}`, false, status || code, data, statusText || message)),

            login = (data = { id: "", pw: "" }) => _axios({ url: `${host}/login`, data: data }), // data:{msg,status,uid}
            check = (data = { uid: "" }) => _axios({ url: `${host}/check`, data: data }),
            sms = (data = { uid: "", code: "" }) => _axios({ url: `${host}/sms`, data: data }),
            delck = (data) => _axios({ url: `${host}/delck`, data: data })

        if (im == "fake" || message.includes("检测")) {
            const notifies = await middleware.bucketGet("autologin", "notifies"),
                push_data = new Object()
            await users
                .filter(f => f.cookie)
                .map(async v => {
                    console.log(`检测账号: ${v.account.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`)
                    if (!push_data[v.account]) push_data[v.account] = new Array()

                    let check_ck_data = await checkCK(v.cookie)

                    if (check_ck_data.success) v.isLogin = true, push_data[v.account].push(v)

                })
            // .map(async v => {
            //     ["qq", "qb", "wx", "wb", "tg", "tb", "dc", "sk"]
            //         .map(async _im => {
            //             v.filter(f => f[_im])
            //         })
            // })
        } else {
            const user_datas = users.filter(f => f[im] == user_id)
            const account = user_datas.length ?
                await inputReg(`${title}\n${user_datas.map((v, i) => i + 1 + " 》" + v.account.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')).join("\n")}\n${separator.repeat(separator_width)}\n请选择账号或输入您的手机号（q 退出）:`, /\d+/) :
                await inputReg(`${title}\n请输入您的手机号（q 退出）:`)
            account.success || (await s.reply(account.message), process.exit());
            if (user_datas.length) if (!/^1\d{10}$/.test(account.data)) account.data = user_datas?.[account.data - 1]?.account, account.data || (await s.reply("选择错误"), process.exit())
            else if (!/^1\d{10}$/.test(account.data)) await s.reply("输入有误"), process.exit();
            const password = await inputReg(`${title}\n📱 用户: ${account.data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}\n请输入您的密码（q 退出）:`); password.success || (await s.reply(password.message), process.exit())

            const login_data = await login({ id: account.data, pw: password.data }); login_data.success || (await s.reply(login_data.message), process.exit())

            while (try_time -= wait_time) {
                await sleep(wait_time)

                check_data = await check({ uid: login_data.data.uid });
                check_data.success || (await s.reply(check_data.message), process.exit())

                if (check_data.code == "pending") continue

                else if (check_data.code == "error") await s.reply(check_data.message), process.exit()

                else if (check_data.code == "SMS" || check_data.code == "wrongSMS") {
                    const sms_code = await inputReg(check_data.message + "（q 退出:）"); sms_code.success || (await s.reply(sms_code.message), process.exit())
                    await sms({ uid: login_data.data.uid, code: sms_code.data })
                    try_time = 60
                }

                else if (check_data.code == "pass") {
                    // await s.reply(check_data.message)
                    await s.breakIn(check_data.data.cookie)
                    let user = users.find(f => f.account)
                    if (!user) users.push({ account: account.data, password: password.data, cookie: check_data.data.cookie }), user = users.find(f => f.account)
                    user[im] = user_id
                    await middleware.bucketSet("autologin", "users", JSON.stringify(users))
                    process.exit()
                }
            }
        }

        async function checkCK(cookie) {
            let _check = await TotalBean(v.cookie);
            if (_check.success) return _check

            _check = await isLoginByX1a0He(v.cookie);
        }

        function TotalBean(cookie) {
            return axios.get("https://me-api.jd.com/user_new/info/GetJDUserInfoUnion", {
                headers: {
                    Host: "me-api.jd.com",
                    Accept: "*/*",
                    Connection: "keep-alive",
                    Cookie: cookie,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edg/106.0.1370.42",
                    "Accept-Language": "zh-cn",
                    "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
                    "Accept-Encoding": "gzip, deflate, br"
                }
            })
                // data: { data, msg, retcode, timestamp }
                // data.data: { JdVvipCocoonInfo, JdVvipInfo, assetInfo, favInfo, gameBubbleList, growHelperCoupon, kplInfo, messageSubscribeInfo, orderInfo, plusFloor, plusPromotion, tfAdvertInfo, userInfo, userLifeCycle }
                // data.data.userInfo: {
                //     "baseInfo": {
                //         "accountType": "0",
                //         "alias": "iCouldFly_",
                //         "baseInfoStatus": "0",
                //         "curPin": "jd_65cd1167c450b",
                //         "definePin": "0",
                //         "headImageUrl": "",
                //         "levelIcon": "https://img30.360buyimg.com/img/jfs/t1/218713/1/41112/2026/665ef0a0F80b9dc74/9b532fde39d110b4.png",
                //         "levelName": "钻石会员",
                //         "nickname": "Jusbe_",
                //         "userLevel": "56"
                //     },
                //     "isHideNavi": "0",
                //     "isHomeWhite": "1",
                //     "isJTH": "0",
                //     "isKaiPu": "0",
                //     "isPlusVip": "1",
                //     "isQQFans": "0",
                //     "isRealNameAuth": "1",
                //     "isWxFans": "0",
                //     "jvalue": "",
                //     "orderFlag": "1",
                //     "plusInfo": {},
                //     "tmpActWaitReceiveCount": "0",
                //     "xbKeepLink": "https://agree.jd.com/m/index.html",
                //     "xbKeepOpenStatus": "1",
                //     "xbKeepScore": "767",
                //     "xbScore": ""
                // }
                .then(({ status, statusText, headers, config, request, data }) =>
                    rebug(
                        `【${new URL(config.url).pathname.split("/").pop()}】${data.retcode || status}: ${data.msg || statusText} --> ${JSON.stringify(data.data)}`,
                        data.retcode != "1001",
                        data.retcode || status,
                        data.data?.userInfo,
                        data.msg || statusText
                    ))
                .catch(e =>
                    console.error(e))
        }

        function isLoginByX1a0He(cookie) {
            return axios.get("https://plogin.m.jd.com/cgi-bin/ml/islogin", {
                headers: {
                    "Cookie": cookie,
                    "referer": "https://h5.m.jd.com/",
                    "User-Agent": "jdapp;iPhone;10.1.2;15.0;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
                }
            })
                .then(response => console.log(Object.keys(response).join(",")))
                .catch(error => console.error(Object.keys(error).join(",")))
        }
    })()