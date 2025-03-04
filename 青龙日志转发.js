// [title: 青龙日志转发]
// [class: 工具类]
// [rule: ?]
// [bypass: true]
// [imType: router]
// [admin: false]
// [disable:true]
// [priority: 1]
// [version: 1.0.0]
// [router: /send_private_msg]
// [method: post]
// [method: get]

const pluginName = getTitle()
const userid = GetUserID()
// const content = GetContent()
Debug(`\n\n\n<div style="text-align: center; font-size: 72px; font-weight: bold;">${pluginName}</div>\n\n`)

function main() {
    // Debug('============================')
    const method = getMethod()
    const data = method == 'get' ? getRouterParams() : JSON.parse(getRouterData())
    let message = data.message

    Debug(`[${method}]${getRouter().slice(1)} 收到消息：${message.split("\n")[0].slice(0, 10) + ' ...'}`)

    const xyo_host = bucketGet("wx", "vlw_addr")
    const xyo_token = bucketGet("wx", "vlw_token")
    const robot_wxid = bucketGet("wx", "robot_wxid")

    const whiteList = [
        [/.*/]
    ]

    const blackList = [
        // ['天气预报'],
        [/^美团[\n$]/],
        ['京东资产变动'],
        ['notifies'],
        ['苏泊尔'],
        ['爱企查'],
        ['葫芦侠'],
        // ['东东农场'],
        ['京东试用'],
        ['极速签到免单'],
        ['评价即有机会获得'],
        ['执行堆栈任务'],
        ['M签到有礼'],
        ['M积分兑换'],
        ['京东资产统计'],
        ['M邀请有礼'],
        ['M等级/生日礼包'],
        ['M关注有礼'],
        // ['M粉丝互动'],
        ['M加购有礼'],
        ['M自动重新拨号'],
        ['M分享有礼'],
        ['M购物车锦鲤'],
        // ['M组队瓜分'],
        ['M关注有礼无线'],
        ['M关注抽奖'],
        ['M完善有礼'],
        ['M无线游戏'],
        ['M幸运抽奖'],
        ['【类型】', '【来源】青龙日志']
    ]

    const passList = [
        /领取成功/, // M等级/生日礼包
        /【.+】建队/, // M组队瓜分
        /【.+】已有[\d\s]+人/, // M组队瓜分
        /【.+】.*(积分|京豆)\d+.*/, // M粉丝互动
        /【.+】已完成加购/, // M购物车锦鲤
        /【.+】京豆[\d+]+/, // M关注有礼
        /【.+】[\d\s]+京豆.已签[\d\s]+天/, // M签到有礼
        /【.+】已签[\d\s]+天/, // M签到有礼
        /【.+】[\d\s]+积分.已签[\d\s]+天/, // M签到有礼
        /【.+】已签[\d\s]+天.[\d\s]+积分/, // M签到有礼
        /【.+】94685d+/, // M关注抽奖
        /幸运抽奖（超级无线）中奖通知[\s\S\n]+已成功自动登记收货地址/, // 幸运抽奖（超级无线）中奖通知
    ]

    const atJD = { success: false, username: new Array() }
    const atJDList = [
        { searchValue: /测试消息/, username: /(?<=【账号[^】]+】\s?)[\S]+(?=\s*\(自动禁用成功!\))/mg },
        { searchValue: /京东CK检测[\n\s\S]👇👇👇👇👇自动禁用账号👇👇👇👇👇/, username: /(?<=【账号[^】]+】\s?)[\S]+(?=\s*\(自动禁用成功!\))/g },
        { searchValue: /农场自动兑换种植[\n\s\S]+已兑换[\s\d]+元红包/, username: /(?<=【账号[\s\d]+[^】]*】\s?)[^已]+(?=\s?已)/mg },
        { searchValue: /东东农场[\n\s\S]+已可领取/, username: /(?<=京东账号\s?\d+\s?\(?)[\S]+/g },
        { searchValue: /新农场任务[\n\s\S]+已种成[\n\s\S]+奖品记录里兑换/, username: /(?<=【(京东)?账号[\s\d]+】\s?)[\S]+/g },
        { searchValue: /互动消息检查[\n\s\S]+\d+\s?京?豆/, username: /(?<=【账号\s?\d+[:：]\s?\(?).+(?=\)?】)/g },
        { searchValue: /互动消息检查[\n\s\S]+有机会获得京豆/, username: /(?<=【账号\s?\d+[:：]\s?\(?).+(?=\)?】)/g },
        { searchValue: /京东调研问卷[\n\s\S]+\d+\s?京?豆/, username: /(?<=\().+(?=\)\n)/g },
        { searchValue: /京东调研问卷[\n\s\S]+\d+\s?京?豆/, username: /(?<=【账号[\s\d]+】\s?).*/g },
        { searchValue: /有机会获得\s?\d+\s?京?豆/, username: /(?<=【账号\s?\d+[:：]\s?\(?).+(?=\)?】)/g },
        { searchValue: /参与活动.*有机会赢\s?\d+\s?京?豆/, username: /(?<=【账号\s?\d+：.+\().+(?=\)】)/g },
        { searchValue: /现在参与新品调研有机会获得\s?\d+\s?京豆奖励/, username: /(?<=【账号\s?\d+：.+\().+(?=\)】)/g },
        { searchValue: /保价成功：.*[\d\.]+\s?元/m, username: /(?<=【京东账号\s?\d+】).+/g },
        { searchValue: /已兑换12元红包/, username: /(?<=\().+(?=\))/g },
        { searchValue: /请去京东APP农场记录里下单/, username: /(?<=【京东账号\s?\d+】.+\().+(?=\))/g },
        { searchValue: /请去京东APP或微信小程序查看/, username: /(?<=【京东账号\s?\d+】).+/g },
        { searchValue: /抽中实物\s?.+/, username: /(?<=\().+(?=\))/g },
        { searchValue: /您忘了种植新的水果/, username: /(?<=京东账号\d+.+\().+(?=\))/g }
    ]

    const replaceList = [
        { searchValue: /^互动消息检查$/g, replaceValue: '互动消息检查[CQ:image,file=http://192.168.1.13:8080/admin/images/gallery/hudongxiaoxi.jpg]' }, // walle 时长通用
        { searchValue: /时间：.*时长：.*/g, replaceValue: '' }, // walle 时长通用
        { searchValue: /\n?账号\[\d+\]\[\d+\]超值福利签到.*/gm, replaceValue: '' }, // 顺丰速运
        { searchValue: /👇👇👇👇👇自动禁用账号👇👇👇👇👇/gm, replaceValue: '👇账号已失效，请重新“登录”👇' }, // ccwav 京东CK检测
        { searchValue: /👇👇👇👇👇失效账号👇👇👇👇👇[\s\S\n]+/gm, replaceValue: '' }, // ccwav 京东CK检测
        { searchValue: /export\s\S+\=.*/gm, replaceValue: '' }, // M签到有礼
        { searchValue: /.*账号\[\d+\]\[\d+\]领券.*: /gm, replaceValue: '、' }, // 滴滴打车
        { searchValue: /.*http.*/gm, replaceValue: '' }, // 链接通用
        { searchValue: /【额外奖励】.*/gm, replaceValue: '' }, // 6DY 旧农场
        { searchValue: /【助力您的好友】.*/gm, replaceValue: '' }, // 6DY 旧农场
        { searchValue: /【今日共浇水】.*/gm, replaceValue: '' }, // 6DY 旧农场
        { searchValue: /.*(本|运行)通知.*/gm, replaceValue: '' }, // 青龙通用
        { searchValue: /.*支付宝.*/gm, replaceValue: '' }, // leaf 通用
        { searchValue: /.*拼多多提现活动.*/gm, replaceValue: '' }, // leaf 通用
        { searchValue: /.*复制.*ZFB.*领红包.*/gm, replaceValue: '' }, // leaf 通用
        { searchValue: /.*淘宝.*/gm, replaceValue: '' }, // leaf 通用
        { searchValue: /.*京东车.*/gm, replaceValue: '' }, // leaf 通用
        { searchValue: /.*上车.*/gm, replaceValue: '' }, // leaf 通用
        { searchValue: /\w+\s?群.*/gm, replaceValue: '' }, // leaf 通用
        { searchValue: /.*通知时间.*/gm, replaceValue: '' }, // 青龙通用
        { searchValue: /.*心跳包.*/gm, replaceValue: '' }, // bilibili 直播
        { searchValue: /.*Ray\.BiliBiliTool\..*/gm, replaceValue: '' }, // bilibili 登录失败
        { searchValue: /开始取关[\s\S\n]+(?=【取关结果】)/gm, replaceValue: '' }, // bilibili 批量取关
        { searchValue: /---开始 抽奖 ---[\s\S\n]+程序发生异常[\s\S\n]+(?=#+\s+账号[\s\d]+#+)/gm, replaceValue: '' }, // bilibili 天选时刻抽奖
        { searchValue: /.*幻生提示.*/gm, replaceValue: '' }, // 萌新通用
        { searchValue: /.*通知时间.*/gm, replaceValue: '' }, // 萌新通用
        { searchValue: /.*红包来了.*/gm, replaceValue: '' }, // leaf 通用
        { searchValue: /.*京东搜索.*/gm, replaceValue: '' }, // leaf 通用
        { searchValue: /.*复制口令.*/gm, replaceValue: '' }, // leaf 通用
        { searchValue: /.*QQ：[\s\S\n]+/gm, replaceValue: '' }, // 鸿德堂
        { searchValue: /^用户\[[\d\*]+\]\s+注册手机号.*$/gm, replaceValue: '' }, // Q必达
        { searchValue: /^用户\[[\d\*]+\]\s+(签到|看广告).*(获得|失败).$/gm, replaceValue: '' }, // Q必达
        { searchValue: /^用户\[[\d\*]+\]\s+当前第[\s\d]+次看视频.*$/gm, replaceValue: '' }, // Q必达
        // { searchValue: /.*(失败|null).*/gm, replaceValue: '' }, // 杰士邦安心福利社
        // { searchValue: /.*签到.*/gm, replaceValue: '' }, // 霸王茶姬
        { searchValue: /重置\S+Token.*/img, replaceValue: '' }, // 广汽传祺
        { searchValue: /点赞成功[\r\n]点赞成功/img, replaceValue: '' }, // 雷达汽车
        { searchValue: /^账号[\[\d\]\s]+浇水成功🎉$/img, replaceValue: '' }, // 得物
        { searchValue: /^账号[\[\d\]\s]+任务成功🎉$/img, replaceValue: '' }, // 得物
        { searchValue: /^账号[\[\d\]\s]+喂食.*成功🎉$/img, replaceValue: '' }, // 得物
        { searchValue: /^账号[\[\d\]\s]+领取任务奖励[成功].*💧🎉$/img, replaceValue: '' }, // 得物
        { searchValue: /^账号[\[\d\]\s]+参与上上签成功🎉$/img, replaceValue: '' }, // 得物
        { searchValue: /==============.*系统通知[\s\S\n]+/img, replaceValue: '' }, // 广汽传祺
        { searchValue: /(?<=刷新广告 - 随机等待\d+s)[\s\S\n]+/gm, replaceValue: '\n...' },
        { searchValue: /(?<=^【距升级Lv\d+】.+$)[\s\S\n]+/gm, replaceValue: '' },
        { searchValue: /(?<=\D?1\d{2})\d{4}(?=\d{4}\D?)/gm, replaceValue: '****' },
        { searchValue: /(?<=[\r\n])[\r\n\s]+/gm, replaceValue: '' },
        { searchValue: /[\r\n]\s*$/gm, replaceValue: '' }
    ]

    const replacePassList = [
        /京东调研问卷/gm,
    ]

    let pushList = [
        'qbgroup:549998515',
        // 'qqgroup:315519023',
        'qqgroup:484584515',
        // 'wxindiv:Liksbe',
        'wxgroup:48236768377',
        'dbgroup:1204509471469080691', //Discord
        'ddgroup:cidQxKZ4sl3BWXZcTHcr9ZC3Q==', //钉钉
        'fsgroup:oc_2136f19ce110bddc9f476be8314d2254', //飞书
        'skgroup:C06Q26UFK8A', //Slack
        'kkgroup:2154870566781349', //Kook
    ]


    whiteList.forEach(item => {
        item.forEach(v => {
            if (Boolean(message.search(v) + 1) == false) {
                // throw new Error('退出，未匹配到白名单：'+v);
                Debug('退出，未匹配到白名单：' + v)
                return process.exit()
            }
        })
    })

    blackList.forEach(item => {
        let isBlack = 1
        item.forEach(v => {
            isBlack *= message.search(v) + 1
        })

        if (Boolean(isBlack)) {
            const pass = passList.filter(v => { return v.test(message) })

            if (isBlack) {
                if (pass.length) {
                    Debug(`黑名单放行：${pass[0]}`)
                } else {
                    // throw new Error('退出，匹配到黑名单组：'+item);
                    Debug('退出，匹配到黑名单组：' + item)
                    return process.exit()
                }
            }
        }
    })

    // Debug(`收到消息：${message}`)
    // Debug(`提取账号：${JSON.stringify(/(?<=【账号\s?\d+[:：]\s?\(?).+(?=\)?】)/g.exec(message))}`)
    atJDList.forEach(item => {
        if (item.searchValue.test(message)) {
            Debug(`匹配 @ 规则：${item.searchValue}`)
            Debug("提取 @ 规则：" + item.username)
            atJD.success = true
            atJD.username = atJD.username.concat(message.match(item.username))
            atJD.username = [...new Set(atJD.username)].filter(v=>{return !(v==undefined||v==""||v==null)})
            Debug(`提取账号（${atJD.username.length}）：${atJD.username}`)
            if (atJD.username == null) notifyMasters(`【青龙日志转发】提取账号失败\n规则：${item.username}\n消息：${message}`)
        }
    })
    // Debug(JSON.stringify(atJD))
    // Debug(JSON.stringify(1))

    replaceList.forEach(item => {
        let pass = false
        replacePassList.forEach(v=>{
            if(v.test(message)) pass = true
        })
        if(!pass) message = message.replace(item.searchValue, item.replaceValue)
    })
    // Debug(JSON.stringify(2))

    pushList = pushList.map(item => {
        return new Object({
            im: item.match(/^\S+(?=group|indiv)/)[0],
            type: item.match(/group|indiv/)[0],
            id: item.match(/(?<=:)\S+(?=$)/)[0]
        })
    })
    Debug("推送目标：" + JSON.stringify(pushList))

    pushList.forEach(item => {
        let content = message
        // Debug(JSON.stringify(1))
        if (atJD.success) {
            Debug(`共找到 ${atJD.username.length} 个账号：${atJD.username}`)
            // Debug(JSON.stringify(2))
            const pinType = 'pin' + item.im.toUpperCase()
            let uids = new Array()
            //atJD.username.push('jd_65cd1167c450b')
            atJD.username.forEach(v => {
                // Debug(JSON.stringify(3))
                const userID = bucketGet(pinType, v)
                Debug(`[${pinType}]开始查找用户：${v}`)
                if (userID != undefined && userID != '') {
                    Debug(`找到用户：${userID}`)
                    uids.push(userID)
                }
            })
            // Debug(JSON.stringify(4))
            uids = [...new Set(uids)]
            Debug("提取用户：" + JSON.stringify(uids))
            if (uids.length) {
                if (item.im == 'qq' && item.type == 'group') {
                    content = uids.map(v=>{return `[CQ:at,qq=${v}]`}).join(" ") + content
                } else if (["qb"].includes(item.im) && item.type == 'group') {
                    content =uids.map(v=>{return `<@!${v}>`}).join(" ") + content
                } else if (["tg","tb"].includes(item.im) && item.type == 'group') {
                    content =uids.map(v=>{return `@${v}`}).join(" ") + content
                } else if (item.im == 'wx' && item.type == 'group') {
                    atJD.uids = uids
                }
            }
        }
        Debug(`开始推送到${item.type == 'group' ? '群组' : '用户'}[${item.im}]：${item.id}\n标题：${content.split('\n')[0]}`)
        if (item.type == 'group' && item.im == 'wx' && Array.isArray(atJD.uids)) {
            request({
                url: xyo_host,
                method: 'post',
                body: {
                    token: xyo_token,
                    api: 'SendGroupMsgAndAt',
                    robot_wxid: robot_wxid,
                    group_wxid: item.id + '@chatroom',
                    member_wxid: atJD.uids.join(','),
                    // member_name: '',
                    msg: '\n' + message
                },
                json: true
            })
        } else if (item.type == 'group') {
            push({ imType: item.im, chatID: item.id, content: content })
        } else if (item.type == 'indiv') {
            push({ imType: item.im, userID: item.id, content: content })
        }
    })
    response({
        "data": {
            "message_id": 0
        },
        "message": `【${getTitle()}】${method}请求响应成功`,
        "retcode": 0,
        "status": "ok"
    })

    response({
        "body": {
            "data": {
                "message_id": 0
            },
            "message": `【${getTitle()}】响应成功`,
            "retcode": 0,
            "status": "ok"
        },
        "header": {},
        "status": "ok",
        "statusCode": 200,
        "success": true
    });
}

main()