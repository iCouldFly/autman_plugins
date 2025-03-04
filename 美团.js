//[title: 美团]
//[class: 工具类]
//[version: 2.0.2 内测]
//[admin: false]
//[rule: ^美团(管理|推送|检测)?$]
//[cron: 20 11,17 * * *]
//[public: false]
//[disable:true]
//[price: 999]
//[priority: 1]
//[platform: all]
//[service: Jusbe]
//[description: 命令：美团管理（可自定义）<br>功能：适用于拉菲本实现：<br> ------ 1）CK管理<br> ------ 2）领券/团币查询<br> ------ 3）wxpusher 资产推送<br> ------ 4）车位收费<br> ------ 5）CK检测（每天12点前运行，在用户管理界面显示 👑 或 ❌<br>配参：<a href="https://docs.qq.com/doc/DUG5MZENuTXp4S1hW" title="【腾讯文档】AutMan 美团 v1.2.8 插件说明">点此查看说明</a><br>其他：请设置配参。旧板青龙不建议使用，自测。<br>建议将旧CK全部删除，用此插件重新添加]
//[param: {"required":true,"key":"meituan.leaf_name","bool":false,"placeholder":"如：qinglong","name":"拉菲容器","desc":"容器管理-对接容器 里的名称，用于 meituanV3.js"}]
//[param: {"required":true,"key":"meituan.bd_name","bool":false,"placeholder":"如：qinglong","name":"彼得容器","desc":"容器管理-对接容器 里的名称，用于 bd_xtb.py（团币）<br>以上至少设置一个容器，可以同名"}]
//[param: {"required":false,"key":"meituan.limit_money","bool":false,"placeholder":"默认 32%","name":"查询金额","desc":"查询多少金额/比例（包含）以上的优惠券<br>不带%为固定金额"}]
//[param: {"required":false,"key":"meituan.appToken","bool":false,"placeholder":"如：AT_abcdefg ...","name":"wxpusher<br>appToken","desc":"用于微信推送，留空则不启用"}]
//[param: {"required":false,"key":"meituan.payCode","bool":false,"placeholder":"如：http://127.0.0.1:8080/....jpg","name":"赞赏码","desc":"用于车位收费，留空则不启用（不要超过80kb）<br>"}]
//[param: {"required":false,"key":"meituan.payPrice","bool":false,"placeholder":"默认：2","name":"车位单价","desc":"每车位/月收费金额"}]
//[param: {"required":false,"key":"meituan.payAccredit","bool":false,"placeholder":"默认：0","name":"初始车位","desc":"每个用户初始赠送的免费车位"}]
//[param: {"required":false,"key":"meituan.timePro","bool":true,"placeholder":"","name":"续费翻倍","desc":"开启后续费价格变为：用户车位×续费单价，并限制有效期>30天时禁止续期"}]
//[param: {"required":false,"key":"meituan.disAutImg","bool":true,"placeholder":"","name":"禁用图床","desc":"频道发图失败尝试切换此开关"}]

Debug('\n\n\n\n\n<div style="text-align: center; font-size: 72px; font-weight: bold;">美团</div>')

const errTime = 6
const inputTime = 60
const recallTime = 60
const timeout = 90

const param1 = param(1)
const content = GetContent()
const userId = GetUserID()
const chatId = GetChatID()
const imType = GetImType()
const isadmin = isAdmin()
const pluginName = `【${getTitle()}】`

let limit_money = bucketGet('meituan', "limit_money"); if (!limit_money || limit_money == '') limit_money = '32%'
const appToken = bucketGet('meituan', "appToken")

const pay_img = bucketGet('meituan', "payCode")
let pay_money = bucketGet('meituan', "payPrice"); if (!pay_money) pay_money = 2

let timePro = bucketGet('meituan', "timePro")
timePro = (timePro == 'true' || timePro === true) ? true : false

let disAutImg = bucketGet('meituan', "disAutImg")
disAutImg = (disAutImg == 'true' || disAutImg === true) ? true : false

function main() {
    const leaf_name = bucketGet('meituan', "leaf_name");
    const bd_name = bucketGet('meituan', "bd_name");
    if (!leaf_name && !bd_name) { return sendErr(pluginName + '插件未设置青龙') }

    // 用户管理系统
    const accredit = new accreditData()
    const userAccredit = accredit.getUser(imType,userId).data

    // tokens系统
    const autMan = new AutData('meituan', 'tokens')
    const userDatas = autMan.get('jid',userAccredit.jid)

    let leaf_ql = leaf_name ? new leaf_mt(leaf_name) : false
    let bd_ql = bd_name ? new bd_mt(bd_name) : false

    //test
    // accredit.com(accredit.getUser('wx','Liksbe').data,userAccredit)

    if (imType == 'fake' || (param1 == '推送' && isadmin)) {//定时任务
        if (appToken) { // wxpusher 推送
            const summary = '美团资产推送 ' //消息摘要，显示在微信聊天页面或者模版消息卡片上，限制长度100，可以不传，不传默认截取content前面的内容。

            Debug('================================')

            Debug('收集用户UID')
            const uids = JSON.parse(bucketGet("meituan", "accredit2")).map(v=>{v.content = '';return v})

            Debug(`共找到 ${uids.length} 个用户`)
            uids.forEach(v=>{Debug(v.jid)})

            Debug('================================')
            let leaf_log = leaf_ql ? leaf_ql.getLogByPhones() : false
            let bd_log = bd_ql ? bd_ql.getLogByUserid() : false
            Debug('================================')
            Debug(`收集leaf日志信息：${leaf_log.success ? '成功' : '失败'}`)
            Debug(`收集bd日志信息：${bd_log.success ? '成功' : '失败'}`)
            // notifyMasters('今日leaf日志提取失败')
            if (leaf_log == false && bd_log == false) return false

            Debug('================================')
            Debug('提取用户日志信息')
            autMan.datas.forEach(item => {
                Debug(`[${item.jid}]${item.nickName}`)
                let str = `😊用户：${item.nickName}\n`
                str += `📞手机：${item.phone.replace(/(?<=\d{3})\d{4}/, '****')}\n`

                const this_leaf_log = leaf_log.data[item.phone]
                if (this_leaf_log == undefined) {
                    str += '❌今日领券: 获取失败\n'
                } else {
                    if (this_leaf_log.summary) {
                        str += `💎${this_leaf_log.summary.replace(', ', '\n💎')}\n`
                    } else {
                        str += '❌钱包余额: 请检查脚本日志\n'
                    }

                    // if (this_leaf_log.xtb) {
                    //     str += `🔍${this_leaf_log.xtb}\n`
                    // } else {
                    //     str += '❌小团币: 请检查脚本日志\n'
                    // }

                    if (this_leaf_log.youhui.length) {
                        str += '✅今日领券: ' + this_leaf_log.youhui.map(yh => {
                            return `${yh.before} 减 ${yh.after}`
                        }).join('、') + '\n'
                    } else {
                        str += `❌今日领券: 无 ${limit_money} 以上优惠\n`
                    }
                }

                const this_bd_log = bd_log.data[item.userId]
                if (this_bd_log == undefined) {
                    str += '❌小团币: 获取失败\n'
                } else {
                    if (this_bd_log.xtb) {
                        str += `🔍${this_bd_log.xtb.replace('运行后', '')}\n`
                    } else {
                        str += '❌小团币: 请检查脚本日志\n'
                    }
                }

                uids.forEach(element => {
                    if(element.jid == item.jid){
                        element.content += str2html(str.replace(/:[ \s]?/g, '：'), item.avatarurl)
                    }
                }); 
            })

            // sendText('😊👆👇🐯🐶🏤🏢🎉🎀🎉🎁🕌🕋🥇📨💶1️⃣⭕❌❓❗✅❎🎯📠📞🎥🔍🔎🔒📓📅📆')
            Debug('================================')
            Debug('开始推送')
            uids.forEach(element => {
                if(element.uid == '' || element.uid == undefined) return rebug(`${element.jid} 未配置UID，跳过推送`)
                sendWxPusher({
                    summary: summary,
                    uids: [element.uid],
                    content: element.content
                })
            })
            sendErr('推送结束')
        }

        // 12点前的定时任务执行CK检测
        if (call("timeFormat")("HH") < 12 && param1 != '推送') {
        // if (true) {
            Debug('================================');

            const str = bucketGet('meituan', 'tokens');
            try {
                this.data = str ? JSON.parse(str) : [];
            } catch (error) {
                return sendErr('系统数据格式错误\n' + error);
            }

            Debug('清空青龙变量');
            if (leaf_ql) leaf_ql.delEnv()
            if (bd_ql) bd_ql.delEnv()

            Debug('================================');
            Debug('执行CK检测');

            const tokens = new Array()
            this.data = this.data.map(
                item => {
                    Debug('================================');
                    if(pay_img && accreditData.check(accredit.getUser('jid',item.jid).data) == false){
                        // 用户授权过期
                        Debug(`${item.userId} 用户授权过期 ${item.jid}`)
                        item.valid = false
                    }else{
                        const uinfo = mtGetUinfo(item.token)
                        if (uinfo) {
                            Debug(`${item.userId} 账号token验证通过`)
                            item.valid = true
                            item.avatarurl = uinfo.avatarurl
                            tokens.push(item.token)
                        } else {
                            Debug(`${item.userId} 账号token失效`)
                            item.valid = false
                        }
                        sleep(5000)
                    }
                    return item
                }
            )

            Debug('================================');
            Debug('重建青龙变量')
            if (leaf_ql) leaf_ql.createEnv(tokens)
            if (bd_ql) bd_ql.createEnv(tokens)

            bucketSet('meituan', 'tokens', JSON.stringify(this.data))
            return this.data
        }
    } else if (param1 == '检测' && isadmin){
        Debug('================================');

            const str = bucketGet('meituan', 'tokens');
            try {
                this.data = str ? JSON.parse(str) : [];
            } catch (error) {
                return sendErr('系统数据格式错误\n' + error);
            }

            Debug('清空青龙变量');
            if (leaf_ql) leaf_ql.delEnv()
            if (bd_ql) bd_ql.delEnv()

            Debug('================================');
            Debug('执行CK检测');

            const tokens = new Array()
            this.data = this.data.map(
                item => {
                    Debug('================================');
                    if(pay_img && accreditData.check(accredit.getUser('jid',item.jid).data) == false){
                        // 用户授权过期
                        Debug(`${item.userId} 用户授权过期 ${item.jid}`)
                        item.valid = false
                    }else{
                        const uinfo = mtGetUinfo(item.token)
                        if (uinfo) {
                            Debug(`${item.userId} 账号token验证通过`)
                            item.valid = true
                            item.avatarurl = uinfo.avatarurl
                            tokens.push(item.token)
                        } else {
                            Debug(`${item.userId} 账号token失效`)
                            item.valid = false
                        }
                        sleep(5000)
                    }
                    return item
                }
            )

            Debug('================================');
            Debug('重建青龙变量')
            if (leaf_ql) leaf_ql.createEnv(tokens)
            if (bd_ql) bd_ql.createEnv(tokens)

            bucketSet('meituan', 'tokens', JSON.stringify(this.data))
            return this.data
    }else {//用户指令
        //账号管理
        // sendText(userDatas)
        let str = '美团账号管理：\n（+ 登记，- 删除，a 查询，q 退出）'
        str += '\n----------------------'
        if (userDatas) {
            userDatas.forEach((v, i) => {
                str += `\n[${i + 1}]${(v.valid == false && pay_img) ? '❌' : '👑'}${v.phone.replace(/(?<=^\d{3})\d{4}/, '****')}`
            });
            str += '\n----------------------\n'
            if (appToken) str += userAccredit.uid ? '🎉微信推送：已设置（w 修改）' : '❌微信推送：未设置（w 设置）'
        }
        if (pay_img) str += `\n🚗车位：${userDatas.length ? userDatas.length : 0}/${userAccredit.accredit}（p 充值）\n📆到期：${userAccredit.deadline}`

        const input_1 = ShuRu(str)
        if (input_1 == '+') { // 添加账号
            Debug('================================')
            Debug('添加账号')
            //初始化授权信息
            // accredit.set(userAccredit)
            if (pay_img) {
                if (!accreditData.check(userAccredit, userDatas.length)) return false
            }

            const userURL = inputURL(); if (!userURL) return false

            let tokens_old = autMan.datas.filter(item => {return item.userId == userURL.userId})[0]
            let token_old = ''
            let jid_old = ''
            if(tokens_old != undefined){
                token_old = tokens_old.token
                jid_old = tokens_old.jid
            }

            if(jid_old != '' && jid_old != userAccredit.jid) {
                Debug('token已登记到其他账号，尝试同步数据')
                jid_old = accredit.com(accredit.getUser('jid',jid_old).data,userAccredit).data.jid
                userAccredit.jid = jid_old
            }

            userURL.jid = userAccredit.jid
            // Debug(`userURL: ${JSON.stringify(userURL)}`)
            autMan.setTokenByUserId(userURL)

            if (leaf_ql) {
                Debug('设置leaf token')
                if (typeof (token_old) == 'string') leaf_ql.del(token_old)
                leaf_ql.add(userURL.token)
            }

            if (bd_ql) {
                Debug('设置bd token')
                if (typeof (token_old) == 'string') bd_ql.del(token_old)
                bd_ql.add(userURL.token)
            }

            sendRecall(`${userURL.phone.replace(/(?<=^\d{3})\d{4}/, '****')} 添加成功！`)
        } else if (/^[aW]$/.test(input_1) && userDatas.length) { // 查询日志
            let leaf_log = leaf_ql ? leaf_ql.getLogByPhones() : false
            let bd_log = bd_ql ? bd_ql.getLogByUserid() : false
            Debug('================================')
            Debug(`查询：获取leaf_log：${leaf_log.success}`)
            Debug(`查询：获取bd_log：${bd_log.success}`)

            userDatas.forEach(item => {
                Debug('================================')
                let str = ''
                if (item.nickName) str += `😊用户：${item.nickName}\n`
                if (item.phone) str += `📞手机：${item.phone.replace(/(?<=\d{3})\d{4}/, '****')}\n`

                if (leaf_log) {
                    if (leaf_log.success) {
                        const this_leaf_log = leaf_log.data[item.phone]
                        Debug(`${item.phone} leaf查询结果：${JSON.stringify(this_leaf_log)}`)
                        if (this_leaf_log == undefined) {
                            str += '❌leaf信息获取失败A\n'
                        } else {
                            if (this_leaf_log.summary) {
                                str += `💎${this_leaf_log.summary.replace(', ', '\n💎')}\n`
                            } else {
                                str += '❌钱包余额: 请检查脚本日志\n'
                            }

                            // if (this_leaf_log.xtb) {
                            //     str += `🔍${this_leaf_log.xtb}\n`
                            // } else {
                            //     str += '❌小团币: 请检查脚本日志\n'
                            // }

                            if (this_leaf_log.youhui.length) {
                                str += '✅今日领券: ' + this_leaf_log.youhui.map(yh => {
                                    return `${yh.before} 减 ${yh.after}`
                                }).join('、') + '\n'
                            } else {
                                str += `❌今日领券: 无 ${limit_money} 以上优惠\n`
                            }
                        }
                    }
                } else {
                    str += '❌今日领券: 获取失败\n'
                }

                if (bd_log) {
                    if (bd_log.success) {
                        const this_leaf_log = bd_log.data[item.userId]
                        Debug(`${item.userId} bd查询结果：${JSON.stringify(this_leaf_log)}`)
                        if (this_leaf_log == undefined) {
                            str += '❌bd信息获取失败A\n'
                        } else {
                            if (this_leaf_log.xtb) {
                                str += `🔍${this_leaf_log.xtb}\n`
                            } else {
                                str += '❌小团币: 请检查脚本日志\n'
                            }
                        }
                    }
                } else {
                    str += '❌小团币: 获取失败\n'
                }

                // str += '\n \n     --- MtManage by Jusbe'
                sendText(str)
            })
            // sendText('😊👆👇🐯🐶🚗🏤🏢🎉🎀🎉🎁🕌🕋🥇📨💶1️⃣⭕❌❓❗✅❎🎯📠📞🎥🔍🔎🔒📓📅📆')
        } else if (/^[wW]$/.test(input_1) && appToken && userDatas.length) { // 设置UID
            if (appToken) {
                userAccredit.uid = getWxPusher(appToken)
                if (userAccredit.uid) {
                    accredit.setUser(userAccredit)
                    return sendRecall(`${userAccredit.uid} 设置成功`)
                } else {
                    return sendErr('获取 UID 失败')
                }
            } else {
                return sendErr('未设置 appToken')
            }
        } else if (/^[pP]$/.test(input_1) && pay_img) { // 充值
            let _str = '请选择充值项目（q 退出）：\n'
            _str += '⒈增加车位\n'
            _str += '⒉增加时间\n'
            _str += '----------------------\n'
            _str += 'tips 1：首次增加车位会赠送时间\n'
            timePro ? _str += 'tips 2：续期价格为所有车位续期总价' : _str += 'tips 2：增加时间会对所有车位有效'
            switch (ShuRu(_str)) {
                case false:
                    return false;
                case '1':
                    accredit.buy(userAccredit, 'accredit')
                    return true;
                case '2':
                    accredit.buy(userAccredit, 'deadline')
                    return true;
                default:
                    return sendErr('输入错误')
            }
        } else if (/^\-\d+$/.test(input_1)) { // 删除账号
            Debug('================================')
            Debug('删除账号')
            const _no = input_1.match(/(?<=^\-)\d+$/)[0]
            // sendText(userDatas.length - _no < userDatas.length)
            if (userDatas.length - _no >= 0 && _no > 0) {

                Debug('删除用户数据')
                autMan.del('userId', userDatas[_no - 1].userId)

                if (leaf_ql) { Debug('删除leaf token'); leaf_ql.del(userDatas[_no - 1].token) }
                if (bd_ql) { Debug('删除bd token'); bd_ql.del(userDatas[_no - 1].token) }

                return sendRecall(`${userDatas[_no - 1].phone.replace(/(?<=^\d{3})\d{4}/, '****')} 删除成功！`)
            } else {
                return sendErr('输入序号有误！')
            }
        } else if (input_1 == false) { // 取消
            return false
        } else { // 输入错误
            return sendErr('输入错误')
        }
    }
}

/** 用户输入URL 
 * @description 引导用户输入URL，识别 userId,token
 * @returns objcet:{nickName,userId,token}
*/
function inputURL() {
    const url = 'https://i.meituan.com/mttouch/page/account'
    const input = ShuRu('请在这里登录后，复制链接发给我\n（q 退出）：\n' + url)
    if (!input) return false

    if (!/https?:.*.meituan\.com\/.*userId=.*token=.*/.test(input)) return sendErr('输入有误')

    const data = {
        userId: input.match(/(?<=userId=)\d+/)[0],
        token: input.match(/(?<=token=)[\w\-]+/)[0],
    }
    const uinfo = mtGetUinfo(data.token); if (!uinfo) return false
    data.valid = true
    data.nickName = uinfo.nickName
    data.avatarurl = uinfo.avatarurl
    data.phone = mtGetPhone(data.userId, data.token); if (!data.phone) return false
    return data
}

/** 用户支付 */
function pay(pay_money) {
    if (atWaitPay()) {
        sendErr('支付系统繁忙，请稍后重试')
    } else {
        const msg = sendText(`请在 ${inputTime} 秒内使用微信扫码支付 ${pay_money} 元（q 退出）：${image(img_url2aut(pay_img))}`)
        const quit = 'q'
        const pay = waitPay(inputTime * 1000, quit)

        RecallMessage(msg)

        if (pay == quit) return sendErr('取消支付')
        if (pay == 'timeout') return sendErr('超时退出')

        notifyMasters(`收款时间：${pay.time}\n收款类型：${pay.type}\n收款来源：${pay.fromName}\n收款金额：${pay.money}\n\n \n     --- MtManage by Jusbe`)
        if (pay.money != pay_money) return sendErr('支付金额错误')
        sendText('支付成功！')
        return true
    }
}

/** 美团API 获取用户信息
 * @param userId 美团ID
 * @param token 美团令牌
 * @returns string
 */
function mtGetUinfo(token) {
    const host = 'https://open.meituan.com/user/v1/info/auditting?fields=auditAvatarUrl,auditUsername'
    // const path = `userId=${userId}&token=${token}`
    // sendText('token: '+token)
    return request({
        url: host,
        method: 'get',
        headers: {
            'Connection': 'keep-alive',
            'Origin': 'https://mtaccount.meituan.com',
            'Referer': 'https://mtaccount.meituan.com/user/',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,en-US;q=0.9',
            'X-Requested-With': 'com.sankuai.meituan',
            'token': token,
            'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; MI 9 SE Build/RKQ1.200826.002)'
        },
    }, function (error, response) {
        if (error) return sendErr(pluginName + '获取用户信息失败' + error)
        if (response.statusCode != 200) return sendErr(pluginName + '获取用户信息失败' + response.statusCode)

        const data = JSON.parse(response.body)
        if (data.error) {
            notifyMasters('【美团】获取用户信息失败：' + JSON.stringify(data) + '\n======================\ntoken：' + token)
            return sendErr(pluginName + 'A' + data.error.message + data.error.code + '：' + data.error.type)
        }

        // sendText('username: '+data.user.username)

        const nickName = data.user.username
        if (!nickName) return sendErr(pluginName + '未找到昵称\nCannot read property \'0\' of undefined')

        const avatarurl = data.user.avatarurl ? data.user.avatarurl : 'https://p0.meituan.net/travelcube/3b142f09b750b48bf0927588b90e01ce10757.png'
        return { nickName: nickName, avatarurl: avatarurl }
    })
}

/** 美团API 获取用户手机
 * @param userId 美团ID
 * @param token 美团令牌
 * @returns int
 */
function mtGetPhone(userId, token) {
    const host = 'https://cs.meituan.com/resource/phone-charge/index.html?'
    const path = `userId=${userId}&token=${token}`
    return request({
        url: host + path,
        method: 'get',
        headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
            'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; MI 9 SE Build/RKQ1.200826.002)'
        },
    }, function (error, response) {
        if (error) return sendErr(pluginName + '获取手机失败' + error)
        if (response.statusCode != 200) return sendErr(pluginName + '获取手机失败' + response.statusCode)

        const phone = response.body.match(/(?<="userPhoneNo":")\d+(?=".+)/)
        if (!phone) return sendErr(pluginName + '获取手机失败\nCannot read property \'0\' of undefined')
        // sendText(phone)
        return phone[0]
    })
}

/** 获取 wxpusher */
function getWxPusher(appToken) {
    const url = 'https://wxpusher.zjiecode.com/api/fun/create/qrcode'
    const extra = {}
    extra[imType] = userId
    return request({
        url: url,
        method: 'post',
        body: {
            appToken: appToken,
            extra: JSON.stringify(extra),
            validTime: inputTime
        }
    }, function (error, response) {
        if (error) return sendErr(error)
        if (response.statusCode != 200) return sendErr('二维码获取失败')
        // Debug(response.body)

        const body = JSON.parse(response.body)
        if (!body.success) return sendErr('二维码获取失败\n' + body.msg)

        return checkWxPusher(body.data.code, body.data.url)
    })
}

/** 检测 wxpusher */
function checkWxPusher(code, img_url) {
    const url = 'https://wxpusher.zjiecode.com/api/fun/scan-qrcode-uid'
    const msg_2 = sendText(`请在 ${inputTime} 秒内使用微信扫码关注应用（q 退出）：`)
    // const msg_1 = imType == 'qb' ? sendText(img_url) : sendImage(img_url)
    let msg_1 = sendImage(img_url2aut(img_url))

    const time = 15
    for (let i = time; i < inputTime; i += time) {
        const quit = input(time * 1000, 3000)
        const result = request({
            url: url + '?code=' + code,
            method: 'get'
        }, function (error, response) {
            // Debug('checkWxPusher: '+JSON.stringify(response))
            if (error) return false
            if (response.statusCode != 200) return false

            const body = JSON.parse(response.body)

            // sendText(i)
            // sendText(response.body)
            // sendText('checkWxPusher: '+JSON.stringify(body.data))

            if (body.success) {
                return body.data
            } else {
                return false
            }
        })

        if (result) return result
        if (quit == 'q' || quit == 'Q') {
            RecallMessage(msg_1)
            RecallMessage(msg_2)
            return false
        }
    }
}

/** 发送 wxpusher */
function sendWxPusher(data) {
    // Debug('sendWxPusher: '+JSON.stringify(data))
    const url = 'https://wxpusher.zjiecode.com/api/send/message'

    return request({
        url: url,
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            ...data, ...{
                "appToken": appToken,
                "contentType": 2,//内容类型 1表示文字  2表示html(只发送body标签内部的数据即可，不包括body标签) 3表示markdown 
                "verifyPay": false //是否验证订阅时间，true表示只推送给付费订阅用户，false表示推送的时候，不验证付费，不验证用户订阅到期时间，用户订阅过期了，也能收到。
            }
        }
    }, function (error, response) {
        // Debug('sendWxPusher: '+JSON.stringify(response))
        if (error) return false
        if (response.statusCode != 200) return false

        const body = JSON.parse(response.body)
        if (body.code != 1000) { Debug('sendWxPusher: ' + body.msg); return false }

        Debug(body.data[0].uid + '：' + body.data[0].status)
        return body.success
    })
}

// 车位管理
class accreditData {
    constructor() {
        const jid_index = 8 // JID 长度
        const bucket_name = "meituan" // 桶名
        const key_name = "accredit2" // 键名
        const payAccredit = bucketGet('meituan', "payAccredit") * 1 // 初始车位
        const payDate = 30 // 初始天数

        // 初始化桶数据（未写入）
        let bucket = bucketGet(bucket_name, key_name)
        if (bucket == '') {
            bucket = new Array()
        } else {
            try {
                bucket = JSON.parse(bucket)
            } catch (e) {
                throw new Error('accredit 数据错误')
            }
        }

        /** 查找用户数据，指定 key-value
         * @param {string} key 查找key
         * @param {string} value 查找value
         */
        this.getUser = function (key, value) {
            let user = bucket.filter(item => {
                if (item != undefined)
                    return item[key] == value
            })[0]
            if (user == undefined) {
                user = {
                    jid: createJid(),
                    accredit: payAccredit,
                    deadline: accreditData.addDate(new Date(), payDate)
                }
                user[imType] = userId
                return rebug( `提取新用户：${user.jid}`,false, user)
            } else {
                return rebug( `提取旧用户：${user.jid}`,true, user)
            }
        }

        /** 保存用户数据
         * @param {object} data 用户数据，需包含JID
         * @returns
         */
        this.setUser = function (data) {
            if (data.jid == undefined || data.jid == '')
                return rebug( '用户数据错误，未找到JID',false, data)
            data[imType] = userId
            data.jid = data.jid.toString()

            let isFind = false
            bucket = bucket.map(item => {
                if (item == undefined)
                    return false
                if (item.jid == data.jid) {
                    item = { ...item, ...data }
                    Debug('data: ' + JSON.stringify(item))
                    isFind = true
                }
                return item
            })
            if (isFind == false) {
                bucket.push(data)
                Debug(`写入新用户：${data.jid}`)
            } else {
                Debug(`写入旧用户：${data.jid}`)
            }

            if (bucket.filter(v => { return v[imType] == userId }).length != 1)
                return rebug( '用户数据错误，存在重复 userId',false, data)

            bucketSet(bucket_name, key_name, JSON.stringify(bucket))
            return { success: true, msg: '保存用户数据成功', data: data }
        }

        // 购买车位、时间
        this.buy = function (userinfo, key) {
            Debug(`${userinfo.jid} 购买${key == 'deadline'?'时间':'车位'}`)
            const now = new Date()
            const old = new Date(userinfo.deadline)
            const over_day = Math.ceil((old.getTime() - now.getTime()) / (1000 * 3600 * 24))

            let money = pay_money
            if (timePro && key == 'deadline') {
                if (over_day > 30) {
                    Debug('有效期大于30天，禁止续期')
                    return sendErr('有效期大于30天，禁止续期')
                } else {
                    money = userinfo.accredit * pay_money
                }
            }

            if (pay(money)) {
                if (key == 'deadline') {
                    if (!userinfo.deadline || now > old) {
                        // sendText('新建日期')
                        now.setMonth(now.getMonth() + 1)
                        userinfo.deadline = call("unixTimeFormat")(
                            now.getTime() / 1000,
                            0,
                            "yyyy-MM-dd"
                        )
                    } else {
                        // sendText('追加日期')
                        old.setMonth(old.getMonth() + 1)
                        userinfo.deadline = call("unixTimeFormat")(
                            old.getTime() / 1000,
                            0,
                            "yyyy-MM-dd"
                        )
                    }
                    // sendText(userinfo.deadline)
                } else if (key == 'accredit') {
                    userinfo.accredit = userinfo.accredit * 1 + 1
                }
                // sendText(JSON.stringify(userinfo))
                this.setUser(userinfo)
                Debug('充值成功')
            } else {
                return false
            }
        }

        /** 合并授权
         * @param {object} user_a 用户信息a，由 this.getUser 获取
         * @param {object} user_b 用户信息b，由 this.getUser 获取
         * @returns {object} user
         */
        this.com = function (user_a, user_b) {
            if(user_a.jid == user_b.jid) return { success:false,msg:'重复的JID',data:user_a}
            Debug(`合并用户：${user_a.jid} <== ${user_b.jid}`)
            
            //总数据桶中删除两个数据
            const newBucket = bucket.filter(item=>{
                if(item.jid != user_a.jid && item.jid != user_b.jid) return item
            })

            //合并用户数据
            const newUser = {...user_b,...user_a}
            Debug("user_a ："+user_a.jid)
            Debug("user_b ："+user_b.jid)
            Debug("newUser ："+newUser.jid)

            if(user_a.uid == undefined || user_a.uid == ''){
                if(user_b.uid != undefined && user_b.uid != ''){
                    newUser.uid = user_b.uid
                    Debug(`合并UID：${newUser.uid}`)
                }
            }

            newUser.accredit = user_a.accredit*1+user_b.accredit*1-payAccredit
            Debug(`合并车位：${user_a.accredit}+${user_b.accredit}-${payAccredit}`)
            
            const day_now = call("timeFormat")("yyyy-MM-dd")
            const day_b = accreditData.subDate(user_b.deadline,day_now)
            const day_a = accreditData.subDate(user_a.deadline,day_now)
            newUser.deadline = accreditData.addDate(day_now,day_a+day_b-payDate)
            Debug(`合并期限：${day_a}+${day_b}-${payDate}`)

            newUser[imType]=userId

            newBucket.push(newUser)
            bucketSet(bucket_name, key_name, JSON.stringify(newBucket))
            return { success: true, msg: '合并用户数据成功', data: newUser }
        }

        /** 新建跨平台JID
         * @returns
         */
        function createJid() {
            const jids = bucket.map(v => {
                if (v != undefined)
                    return v.jid
            })
            let random = ''
            do {
                random = Math.random().toString().slice(2, jid_index + 2)
            } while (jids.includes(random))
            return random
        }

        // 旧数据迁移
        function movData(){
            if(bucket.length == 0) {//不存在新版数据
                let bucket_old = bucketGet(bucket_name, "accredit")
                if (bucket_old != '') { //已存在旧版数据
                    try {
                        bucket_old = JSON.parse(bucket_old)
                    } catch (e) {
                        throw new Error('旧版数据错误')
                    }

                    Debug("旧数据迁移")
                    bucket_old.forEach(item=>{
                        delete item.userId

                        if(item.jid == undefined || item.jid == ''){
                            item.jid = createJid()
                        }
                        bucket.push(item)
                    })
                    bucketSet(bucket_name, key_name, JSON.stringify(bucket))
                }
            }

            //tokens迁移
            let old_bucket = bucketGet("meituan","users")
            let new_bucket = bucketGet("meituan","tokens")
            
            if(old_bucket == '') return false // 不存在旧token
            if(new_bucket != '') return false // 已存在新token

            Debug('开始迁移旧版tokens')
            old_bucket = JSON.parse(old_bucket)
            new_bucket = old_bucket.map(item=>{
                if(item.jid == undefined){
                    const ims = ['wx','wb','qq','qb','tg','tb','uid']
                    for(let a=0;a<ims.length;a++){
                        const token_im = ims[a]
                        const token_uid = item[ims[a]]
                        if(token_uid != undefined){
                            let user = bucket.filter(v=>{return v[token_im]==token_uid})[0]
                            item.jid = user['jid']
                            if(item.jid != '' && item.jid != undefined){
                                Debug(`tokens jid：[${ims[a]}]${item[ims[a]]} = ${item.jid}（${typeof item.jid}）,uid=${item.uid}`)
                                if(item.uid != '' && item.uid != undefined){
                                    if(user.uid == '' || user.uid == undefined){
                                        Debug('从旧token同步uid')
                                        bucketSet("meituan","accredit2",JSON.stringify(bucket.map(s=>{
                                            if(s.jid == item.jid){
                                                s.uid = item.uid
                                            }
                                            return s
                                        })))
                                    }
                                }
                                ims.forEach(c=>{delete item[c]})
                                return item
                            }else{
                                Debug('未找到JID')
                            }
                        }
                    }
                }
                return item
            })
            bucketSet("meituan","tokens",JSON.stringify(new_bucket))
            // Debug(JSON.stringify(new_bucket))
        }
        movData()

        return this
    }

    /** 授权验证
     * @param {object} user 用户信息，由 this.getUser 获取
     * @param {number} accredit 用户当前车位
     * @returns {boolean}
     */
    static check = function (user, accredit) {
        Debug(`验证用户：${user.jid}，车位：${accredit}/${user.accredit}，到期：${user.deadline}`)
        if (!user.accredit || user.accredit <= accredit) {
            Debug('车位不足')
            return sendErr('车位不足')
        }

        const now = new Date()
        const old = new Date(user.deadline)
        if (!user.deadline || now > old) {
            Debug('授权过期')
            return sendErr(`${user.jid} 授权过期`)
        }
        Debug('验证通过')
        return true
    }

    /** 日期变更
     * @param {string} date_str 日期，格式"yyyy-MM-dd"
     * @param {number} day 要增加或减少的天数
     * @returns {string} date_str 日期，格式"yyyy-MM-dd"
     */
    static addDate = function (date_str = '', day = 0) {
        const date = new Date(date_str)
        date.setDate(date.getDate() + day)
        return call("unixTimeFormat")(
            date.getTime() / 1000,
            0,
            "yyyy-MM-dd"
        )
    }

    /** 日期计算
     * @param {string} endDate 结束日期，格式"yyyy-MM-dd"
     * @param {string} startDate 起始日期，格式"yyyy-MM-dd"，默认为当天
     * @returns
     */
    static subDate = function (endDate, startDate = null) {
        const a = new Date(endDate)
        const b = startDate ? new Date(startDate) : new Date()
        const diff = a - b
        const day = Math.floor(diff / (1000 * 60 * 60 * 24))
        // Debug(`距离 ${endDate} 还有 ${day} 天`)
        return day
    }
}

/** autMan bucket JSON管理
 * @description 
 * @param bucket 桶
 * @param key 键
 * @returns {any}
 */
class AutData {
    constructor(bucket, key) {
        // sendText(bucket + ',' + key)
        const str = bucketGet(bucket, key)
        try {
            this.datas = str ? JSON.parse(str) : []
        } catch (error) {
            return sendErr('系统数据格式错误\n' + error)
        }

        this.new = function (data) {
            data.nickName = data.nickName ? data.nickName : ''
            data.phone = data.phone ? data.phone : ''
            data.userId = data.userId ? data.userId : ''
            data.token = data.token ? data.token : ''
            this.datas.push(data)
            bucketSet(bucket, key, JSON.stringify(this.datas))
            // sendText(`newData: ${JSON.stringify(data)}`)
            // sendText(`newDatas: ${JSON.stringify(this.datas)}`)
            return data
        }

        this.get = function (name, value) {
            if (value == undefined)
                return Debug(`A获取 ${name} 失败`)
            const data = this.datas.filter(item => {
                if (item[name] == undefined)
                    return false
                if (item[name])
                    return item[name].toString() == value.toString()
            })

            Debug(`${value} 获取账号 ${data.length} 个`)
            return data
        }

        this.set = function (name, value, data) {
            // sendText(JSON.stringify(data))
            let init = true
            for (let i = 0; i < this.datas.length; i++) {
                if (this.datas[i][name] == value) {
                    for (let a in data) {
                        this.datas[i][a] = data[a]
                    }
                    init = false
                }
            }
            if (init) this.new(data)
            bucketSet(bucket, key, JSON.stringify(this.datas))
            // sendText(`bucket: ${bucket}\nkey: ${key}\ndatas: ${this.datas}`)
            return this.datas
        }

        this.setTokenByUserId = function(data){
            // Debug(JSON.stringify(data))
            if(data.jid == '' || data.jid == undefined) return rebug('addTokenByUserId：未包含jid',false,data)
            if(data.userId == '' || data.userId == undefined) return rebug('addTokenByUserId：未包含userId',false,data)
            
            let isFind = false
            this.datas = this.datas.map(item=>{
                if(item.userId == data.userId){
                    item = {...item,...data}
                    Debug(`${data.jid} 用户更新token：${item.userId}`)
                    isFind = true
                }
                return item
            })
            if(isFind == false) {
                Debug(`${data.jid} 用户新增token：${data.userId}`)
                this.datas.push(data)
            }
            bucketSet(bucket, key, JSON.stringify(this.datas))
            return data
        }

        this.del = function (name, value) {
            // sendText(`删除 ${name}，${value}`)
            const _newData = this.datas.filter(item => {
                return item[name] != value
            })
            bucketSet(bucket, key, JSON.stringify(_newData))
            return _newData
        }

        return this
    }
}

/** 获取青龙
 * @description 使用 autMan 容器名称获取青龙
 * @param name
 * @returns Qinglong
 */
function getQL(name) {
    const ql_json = bucketGet("qinglong", "QLS");; if (!ql_json) { return sendErr(pluginName + '系统未配置青龙') }
    const ql_data = JSON.parse(ql_json).filter(item => { return item.name == name }); if (!ql_data.length) { return sendErr(pluginName + '未找到青龙') }

    return new Qinglong(ql_data[0].host, ql_data[0].client_id, ql_data[0].client_secret)
}

/** 拉菲青龙管理
 * @description 变量 meituanCookie
 * @param name 容器名称
 * @returns 
 */
function leaf_mt(name) {
    // sendText('name: '+name)
    this.separator = '\n\n'
    if (!name || name == '') return false

    const ql = getQL(name)
    let ql_data = ql.GetEnvs('meituanCookie');
    if (!ql_data) return sendErr('读取拉菲变量失败1')
    if (!ql_data.data) return sendErr('读取拉菲变量失败2')
    let data = ql_data.data[0] ? ql_data.data[0] : { id: '', value: '', name: 'meituanCookie', remarks: '' }
    this.values = data.value ? data.value.split(this.separator).map(item => { if (item) return item.replace(/;?\s+$/, '') }) : []
    // sendText('value: '+this.values)

    this.add = function (token) {
        const t = token.replace(/;?\s+$/, '')
        if (!this.values.includes(token)) this.values.push(t)

        // sendText('value: '+this.values)
        set(this.values)
        return this.values
    }

    this.del = function (token) {
        const t = token.replace(/;?\s+$/, '')
        this.values = this.values.filter(item => {
            return item != t
        })

        // sendText('value: '+JSON.stringify(this.values))
        set(this.values)
        return this.values
    }

    this.delEnv = function(){
        ql.DeleteEnvs([data.id])
    }
    
    this.createEnv = function(tokens){
        return ql.CreateEnvs([{ value: tokens.join(this.separator), name: 'meituanCookie', remarks: 'MtManage by Jusbe' }])
    }

    this.getLogByPhones = function () {
        const data = new Object({
            success: false,
            msg: '',
            data: new Object()
        })

        let logs = ql.GetLogs()
        if (logs.code != 200) return { ...data, ...{ msg: 'leaf获取日志列表失败' } }

        logs = logs.data
        if (!Array.isArray(logs)) return { ...data, ...{ msg: 'leaf获取日志列表格式错误' } }
        if (logs.length == 0) return { ...data, ...{ msg: 'leaf未找到任何日志' } }

        logs = logs.filter(item => {
            return item.key.includes('meituanV3')
        })
        if (logs.length == 0) return { ...data, ...{ msg: 'leaf未找到meituanV3日志1' } }
        if (logs[0].children.length == 0) return { ...data, ...{ msg: 'leaf未找到meituanV3日志2' } }

        logs = logs[0].children.filter(item => {
            return item.title.includes(call("timeFormat")("yyyy-MM-dd"))
        })
        if (logs.length == 0) return { ...data, ...{ msg: 'leaf未找到今日日志' } }

        for (let i = 0; i < logs.length; i++) {
            const { title, parent } = logs[i]
            Debug(`================================`)
            Debug(`leaf 开始读取今天第${i + 1}篇日志`)
            // Debug(`leaf 开始读取今天第${i+1}篇日志：${parent}_${title}`)

            const log_data = ql.GetLog(title, parent)
            if (log_data.code != 200) {
                Debug(`leaf 日志${i + 1}获取失败：${log_data.code}`)
                continue
            }

            const summarys = log_data.data.match(/.*\d{11}.*钱包余额.*立减金.*(?=\n)/g)
            if (Array.isArray(summarys)) {
                Debug(`leaf 日志${i + 1}获取总结：${summarys.length} 条`)
                summarys.forEach(item => {
                    const phone = item.match(/\d{11}/)
                    if (data.data[phone] == undefined) data.data[phone] = new Object()
                    data.data[phone].summary = item.match(/(?<=\d{11}.).*/)[0]
                })
            } else {
                Debug(`leaf 日志${i + 1}获取总结失败`)
            }

            // const xtb = log_data.data.match(/.*\d{11}.*小团币.*\d+(?=\n)/g)
            // if (Array.isArray(xtb)) {
            //     Debug(`leaf 日志${i + 1}获取小团币信息：${xtb.length} 条`)
            //     xtb.forEach(item => {
            //         const phone = item.match(/\d{11}/)
            //         if (data.data[phone] == undefined) data.data[phone] = new Object()
            //         data.data[phone].xtb = item.match(/(?<=\d{11}.).*/)[0]
            //     })
            // } else {
            //     Debug(`leaf 日志${i + 1}获取小团币信息失败`)
            // }

            const youhui_black = new Array(
                "酒水","水果","体检","买药"
            )
            const youhuis = log_data.data.match(/.*\d{11}.*\d+.{0,3}减\s?\d+(?=\n)/g)
            // Debug(JSON.stringify(youhuis))
            if (Array.isArray(youhuis)) {
                Debug(`leaf 日志${i + 1}获取领券：${youhuis.length} 条`)
                let _num = 0
                youhuis.forEach(item => {
                    let black = false
                    youhui_black.forEach(v=>{
                        if(item.includes(v)) return black = true
                    })
                    if(black) return
                    // Debug(item)
                    const phone = item.match(/\d{11}/)
                    if (data.data[phone] == undefined) data.data[phone] = new Object()
                    if (!Array.isArray(data.data[phone].youhui)) data.data[phone].youhui = new Array()

                    const _d = {
                        before: item.match(/\d+(?=\s?.{0,3}减\s?\d+)/)[0],
                        after: item.match(/(?<=\d+\s?.{0,3}减\s?)\d+/)[0],
                    }
                    _d.scale = Math.ceil(_d.after / _d.before * 100)

                    if (limit_money.includes('%')) {
                        if (_d.scale > limit_money.slice(0, -1)) {
                            data.data[phone].youhui.push(_d)
                            _num++
                        }
                    } else {
                        if (_d.after > limit_money) data.data[phone].youhui.push(_d)
                        _num++
                    }
                })
                Debug(`leaf 日志${i + 1}筛选完成，找到${_num}条符合的记录`)
                data.success = true
                data.msg = 'leaf日志：成功'
            } else {
                Debug(`leaf 日志${i + 1}获取领券失败`)
            }
            Debug(`================================`)
            Debug(`leaf 日志${i + 1}共找到以下 phone：`)
            for (let a in data.data) {
                Debug(a)
            }
        }
        // Debug('+++++++++++++++++++++++++++++++++++++++')
        // Debug(`leaf 日志筛选结果${JSON.stringify(data.data)}`)
        return data
    }

    function set(values) {
        const { id, name } = data
        // sendText('value: '+this.values)
        const value = values.join('\n\n')
        const remarks = 'MtManage by Jusbe'

        if (id) {
            ql.PutEnvs({ id:id, name:name, value:value, remarks:remarks })
        } else {
            ql.CreateEnvs([{ name:name, value:value, remarks:remarks }])
        }
    }

    return this
}

/** 彼得青龙管理
 * @description 变量 meituanCookie
 * @param name 容器名称
 * @returns 
 */
function bd_mt(name) {
    this.separator = '&'
    // sendText('name: '+name)
    if (!name || name == '') return false

    const ql = getQL(name)
    let ql_data = ql.GetEnvs('bd_mttoken');
    if (!ql_data) return sendErr('读取彼得变量失败1')
    if (!ql_data.data) return sendErr('读取彼得变量失败2')
    let data = ql_data.data[0] ? ql_data.data[0] : { id: '', value: '', name: 'bd_mttoken', remarks: '' }
    this.values = data.value ? data.value.split(this.separator).map(item => { if (item) return item.replace(/;?\s+$/, '') }) : []
    // sendText('value: '+this.values)

    this.add = function (token) {
        const t = token.replace(/;?\s+$/, '')
        if (!this.values.includes(token)) this.values.push(t)

        // sendText('value: '+this.values)
        set(this.values)
        return this.values
    }

    this.del = function (token) {
        const t = token.replace(/;?\s+$/, '')
        this.values = this.values.filter(item => {
            return item != t
        })

        // sendText('value: '+JSON.stringify(this.values))
        set(this.values)
        return this.values
    }

    this.delEnv = function(){
        ql.DeleteEnvs([data.id])
    }

    this.createEnv = function(tokens){
        return ql.CreateEnvs([{ value: tokens.join(this.separator), name: 'bd_mttoken', remarks: 'MtManage by Jusbe' }])
    }

    this.getLogByUserid = function () {
        const data = new Object({
            success: false,
            msg: '',
            data: new Object()
        })

        let logs = ql.GetLogs()
        if (logs.code != 200) return { ...data, ...{ msg: '彼得获取日志列表失败' } }

        logs = logs.data
        if (!Array.isArray(logs)) return { ...data, ...{ msg: '彼得获取日志列表格式错误' } }
        if (logs.length == 0) return { ...data, ...{ msg: '彼得未找到任何日志' } }

        logs = logs.filter(item => {
            return item.key.includes('bd_xtb')
        })
        if (logs.length == 0) return { ...data, ...{ msg: '彼得未找到bd_xtb日志1' } }
        if (logs[0].children.length == 0) return { ...data, ...{ msg: '彼得未找到bd_xtb日志2' } }

        const { title, parent } = logs[0].children[0]
        Debug(`================================`)
        Debug(`彼得 开始读取最新日志`)
        // Debug(`彼得 开始读取今天第${i+1}篇日志：${parent}_${title}`)

        const log_data = ql.GetLog(title, parent)
        if (log_data.code != 200) {
            Debug(`彼得 日志获取失败：${log_data.code}`)
        }

        const xtb = log_data.data.match(/账号.*运行完成[\n\r.]+运行后小团币.*/g)
        if (Array.isArray(xtb)) {
            data.success = true
            data.msg = 'bd日志：成功'
            Debug(`彼得 日志获取小团币信息：${xtb.length} 条`)
            xtb.forEach(item => {
                const userid = /\(\d+\)/.exec(item)[0].slice(1, -1)
                const msg = /运行后小团币.*/.exec(item)[0].replace(/\:\s*/, '：')
                // Debug(Array.isArray(userid))
                if (data.data[userid] == undefined) data.data[userid] = new Object()
                data.data[userid].xtb = msg
            })
        } else {
            Debug(`彼得 日志获取小团币信息失败`)
        }

        Debug(`================================`)
        Debug(`彼得 日志共找到以下 userId：`)
        for (let a in data.data) {
            Debug(a)
        }

        // Debug('+++++++++++++++++++++++++++++++++++++++')
        // Debug(`彼得 日志筛选结果${JSON.stringify(data.data)}`)
        return data
    }

    function set(values) {
        const { id, name } = data
        // sendText('value: '+this.values)
        const value = values.join('&')
        const remarks = 'MtManage by Jusbe'

        if (id) {
            ql.PutEnvs({ id:id, name:name, value:value, remarks:remarks })
        } else {
            ql.CreateEnvs([{ name:name, value:value, remarks:remarks }])
        }
    }

    return this
}

/** 青龙API
 * @description 青龙API封装对象
 * @param ql_ipport 青龙地址端口，例：http://127.0.0.1:5700
 * @param client_id 青龙授权ID
 * @param client_secret 青龙授权秘钥
 * @returns Qinglong
 */
function Qinglong(ql_ipport, client_id, client_secret) {
    this.ql_ipport = ql_ipport;
    this.client_id = client_id;
    this.client_secret = client_secret
    this.token = ""

    this.getToken = function () {
        //连接青龙获取token
        var qltoken = request({
            // 内置http请求函数
            url:
                this.ql_ipport +
                "/open/auth/token?client_id=" +
                this.client_id +
                "&client_secret=" +
                this.client_secret,
            //请求链接
            method: "get",
            //请求方法
            dataType: "json",
            //这里接口直接返回文本
        });
        if (qltoken && qltoken != '') return qltoken.data.token
    }

    if (!this.token) {
        this.token = this.getToken()
    }

    //其他接口
    this.ApiQL = function (api, apd, method, body = "") {
        var url = this.ql_ipport + "/open/" + api + apd//"?searchValue="+searchValue+"&t=" + Date.now();
        // Debug("青龙URL：" + url)
        // Debug("青龙BODY：" + body)
        var json = JSON.parse(
            request({
                url: url,
                method: method,
                headers: {
                    //"Content-Type": "application/x-www-form-urlencoded",
                    "Content-Type": "application/json;charset=UTF-8",
                    Authorization: "Bearer " + this.token,
                },
                body: body,
            }))
        if (json == undefined) {
            notifyMasters('青龙请求失败：' + api + '/' + apd)
            Debug('青龙请求失败：' + api + '/' + apd)
        }
        Debug(json.code == 200 ? "青龙请求成功" : `青龙请求失败：${JSON.stringify(json)}`)
        return json
    }

    //关键词获取crons
    this.GetCrons = function (keyword) {
        return this.ApiQL("crons", "?searchValue=" + keyword + "&t=" + Date.now(), "get", "")
    }

    //启用定时任务
    this.EnableCrons = function (cronIDs) {
        return this.ApiQL("crons", "enable?t=" + Date.now(), "put", "\[" + cronIDs.join(",") + "\]")
    }

    //禁用定时任务
    this.DisableCrons = function (cronIDs) {
        return this.ApiQL("crons", "disable?t=" + Date.now(), "put", "\[" + cronIDs.join(",") + "\]")
    }

    //获取变量
    this.GetEnvs = function (value_name) {
        return this.ApiQL("envs", "?searchValue=" + value_name + "&t=" + Date.now(), "get")
    }

    //获取所有日志
    this.GetLogs = function () {
        return this.ApiQL("logs", "?t=" + Date.now(), "get", "")
    }

    //获取指定日志
    this.GetLog = function (title, parent) {
        return this.ApiQL("logs", "/" + title + "?path=" + parent + "&t=" + Date.now(), "get", "")
    }

    //新建变量
    this.CreateEnvs = function (envData = [{ "value": "env", "name": "CreateEnvs name", "remarks": "CreateEnvs remarks" }]) {
        return this.ApiQL("envs", "?t=" + Date.now(), "post", envData)
    }

    //修改变量
    this.PutEnvs = function (envData = { "id": "id", "remarks": "remarks", "value": "PutEnvs value", "name": "PutEnvs name" }) {
        return this.ApiQL("envs", "?t=" + Date.now(), "put", envData)
    }

    //删除变量
    this.DeleteEnvs = function (envIDs) {
        Debug(`青龙删除变量：${envIDs}`)
        return this.ApiQL("envs", "?t=" + Date.now(), "delete", "[" + envIDs.join(",") + "]")
    }

    return this
}

/** 错误提示
 * @description 
 * @param tap 提示内容
 * @returns false
 */
function sendErr(tap) {
    let s = sendText(tap)
    sleep(errTime * 1000)
    RecallMessage(s)
    return false
}

/** 提示
 * @description 
 * @param tap 提示内容
 * @returns true
 */
function sendRecall(tap) {
    let s = sendText(tap)
    sleep(recallTime * 1000)
    RecallMessage(s)
    return true
}

/** 输入
 * @description 
 * @param tap 提示内容
 * @returns {any}
 */
function ShuRu(tap) {
    let t1 = sendText(tap)
    let s = input(inputTime * 1000, 3000)
    if (s == null || s == '') {
        RecallMessage(t1);
        sendErr(`超时，${inputTime}秒内未回复`)
        return false
    } else if (s == "q" || s == "Q") {
        RecallMessage(t1);
        sendErr("已退出会话");
        return false
    } else {
        RecallMessage(t1);
        return s;
    }
}

// 文本转html
function str2html(text, img) {
    // Debug('text: ' + text)
    let outStr = '<style> table { border-collapse: collapse; background-color: lightyellow; border: 1px solid grey; } td { border: 1px solid grey; text-align: left; vertical-align: middle; padding-left: 1ch; } .fixed-width { width: 14ch; } .fixed-width-large { width: 18ch; } </style>'
    outStr += '<table><tbody>'

    // 分割文本为行
    var lines = text.split('\n');

    let rowspan = 1
    let outStr2 = ''
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('：')) {
            const [tag, msg] = lines[i].split('：')
            outStr2 += '<tr>'
            outStr2 += `<td class="fixed-width">${tag}</td>`
            outStr2 += `<td class="fixed-width-large">${msg}</td>`
            outStr2 += '</tr>'

            rowspan++
        }
    }

    outStr += `<tr><th rowspan="${rowspan}" class="center-img" align="middle"><img src="${img}" alt="用户头像加载失败" style="width:250px"></img></th></tr>`
    outStr += outStr2
    outStr += '<p>'

    outStr += '</tbody></table>'
    return outStr
}

function img_url2aut(url) {
    if (imType != 'qb' || disAutImg == true) { Debug(`使用原始图片：${url}`); return url }
    Debug(`上传图片到aut：${url}`)

    //图片过大下载失败，无法try
    //js插件【美团】运行错误：runtime error: index out of range [500000] with length 500000
    let img = imageDownload(url, './qrcode.png')

    if (img.success == false) { Debug(`图片读取失败`); return false }
    const ib = encodeURIComponent(img.base64);

    const username = bucketGet("cloud", "username")
    const password = bucketGet("cloud", "password")

    return request({
        url: "http://aut.zhelee.cn/imgUpload",
        method: "post",
        dataType: "json",
        formData: {
            username: username,
            password: password,
            imgBase64: ib
        }
    }, function (error, response) {
        if (error != null) { Debug(`图片上传失败A：${url}\n${JSON.stringify(error)}`); return false }
        if (response.statusCode != 200) { Debug(`图片上传失败B${response.statusCode}：${url}\n${JSON.stringify(response)}`); return false }
        if (response.body.code != 200) { Debug(`图片上传失败C${response.body.code}：${url}\n${JSON.stringify(response)}`); return false }

        Debug(`图片上传成功：${response.body.result.path}`)
        return response.body.result.path
    })
}

function rebug(msg,success=false,data=null){
    let log = typeof msg == 'object' ? JSON.stringify(msg) : msg
    Debug(log)
    return {success:success,msg:msg,data:data}
}

main()