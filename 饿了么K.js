//[author: jusbe]
//[title: 饿了么K]
//[class: 工具类]
//[version: 2.4.0 x5]
//[admin: false]
//[rule: ^tool$]
//[cron: 30 11,17 * * *]
//[public: false]
//[disable:true]
//[price: 2]
//[priority: 1]
//[platform: all]
//[service: Jusbe]
//[description: <a href="https://docs.qq.com/doc/DR2lwVkRPbEpJQnZv" title="by justore">查看文档</a><br>对接 ElmWeb（自行确认 ElmWeb 是否可用）<br>首发：20231001]
//[param: {"required":true,"key":"elmtool.host","bool":false,"placeholder":"如：http://127.0.0.1:8081","name":"后台地址","desc":"elmtool 的地址"}]
//[param: {"required":false,"key":"elmtool.admin","bool":false,"placeholder":"如：admin","name":"管理员账号","desc":"elmtool 的管理员账号，用于发卡功能"}]
//[param: {"required":false,"key":"elmtool.admin_pw","bool":false,"placeholder":"如：123456","name":"管理员密码","desc":"elmtool 的管理员密码，用于发卡功能"}]
//[param: {"required":false,"key":"elmtool.payCode","bool":false,"placeholder":"如：http://127.0.0.1:8080/....jpg","name":"赞赏码地址","desc":"用于车位收费，必须设置管理员账号/密码，留空则不启用<br>"}]
//[param: {"required":false,"key":"elmtool.payAccount","bool":false,"placeholder":"默认：2","name":"车位单价","desc":"每车位收费金额"}]
//[param: {"required":false,"key":"elmtool.payDuration","bool":false,"placeholder":"默认：2","name":"续期价格","desc":"每月续费金额"}]
//[param: {"required":false,"key":"elmtool.appToken","bool":false,"placeholder":"如：AT_abcdefg ...","name":"wxpusher<br>appToken","desc":"用于微信推送，建议关闭面板自带wxpusher功能<br>留空则不启用"}]

Debug('\n<div style="text-align: center; font-size: 72px; font-weight: bold;">饿了么K</div>')
const errTime = 6
const inputTime = 60
const recallTime = 60
const timeout = 90
const key = param(1)
const content = GetContent()
const userId = GetUserID()
const chatId = GetChatID()
const imType = GetImType()
const pluginName = getTitle()

//读取WXPUSHER配置
const appToken = bucketGet('elmtool', 'appToken')
const pusher = appToken ? new WxPusher(appToken) : false

function main() {
    //读取后台地址
    const dashboard_host = bucketGet('elmtool', 'host')
    if (!/https?\:\/\/\S+\:\d+/.test(dashboard_host)) return sendErr('后台地址错误')

    // 定时任务
    if (imType == 'fake') {
        Debug('============================')
        if (pusher == false) return Debug('未配置 appToken，不执行推送')

        Debug('开始执行推送任务')
        const users = getUsers()
        if (users.length) {
            Debug('获取用户列表成功')

            const summary = '饿了么K资产推送'
            users.forEach((item, index) => {
                Debug('============================')
                const { username, password, uid } = item
                // Debug(JSON.stringify(item))
                Debug(`用户 ${index} 账号：${username}，UID：${uid}`)

                if (typeof (username) != 'string' || typeof (password) != 'string') {
                    return Debug(`用户 ${index} 未设置账号/密码，跳过`)
                }

                if (typeof (uid) != 'string') {
                    return Debug(`用户 ${index} 未设置UID，跳过`)
                }

                const dashboard = new Dashboard(dashboard_host, username, password)
                if (!dashboard.success) return Debug(`用户 ${index} 登录失败，跳过。${JSON.stringify(dashboard)}`)

                const cks = dashboard.getDashboardInfo().cks
                Debug(`用户 ${index} 有 ${cks.length} 个账号`)

                let content = new String('')
                cks.forEach((v, i) => {
                    // Debug('\n++++++++++++++++++++++++++++++\n                         '+getUsers().map(v=>{return v.wx}).filter(v=>{return v=='Liksbe'}).length+'\n++++++++++++++++++++++++++++++\n')
                    Debug('~~~~~~~~~~~~~~~~~~~~~~~~')
                    Debug(`用户 ${index} 开始获取查询 ${v.elm_name} 信息`)
                    const body = dashboard.query_cookie(v.tool_id)
                    const query_data = body.data

                    let outmsg = ''

                    if (body.success) { // 存活ck
                        // sendText('💼🌂🎈🎉🎀🎎🎏🎐🎁🎊✅❎❌⭕🔴💣📠💿🎛📷🎥🎚🔍🔎📲📹💰📍🔒💻📻📺📟💾📼📮📭📕📔📝🔔🔌📊🔋📇📑📦📄📃📖📈📉📩📨📒📧📓📙📫📪📗📬📡📯⏰🔮🔭🔬💴💷💶💸💵💳📤📥📜📏📌📐🖇📎📆📁📅🔖📰🚗🥇🥈🥉🎯🎬🏆')
                        outmsg = `📞手机号：${query_data.mobile}\n`
                        outmsg += `😊昵称：${query_data.user_name ? query_data.user_name : '未设置昵称'}\n`
                        outmsg += `📭账号ID：${query_data.user_id}\n`
                        outmsg += `📲是否APPCK：${query_data.is_app_cookie ? '是' : '否'}\n`
                        outmsg += `🥇乐园币余额：${query_data.integral_property}\n`
                        outmsg += `🥈乐园币收入：${query_data.today_property}\n`
                        outmsg += `⏰CK过期时间：${query_data.expire_time}\n`
                    } else { // 失效CK
                        outmsg = `❌${v.elm_name}：${query_data}`
                    }
                    content += str2html(outmsg)
                })

                if (content != '') {
                    if (!bucketGet('elmtool', "noby")) { content += '<p align="right">----- 饿了么K by Jusbe</p>' }

                    Debug('~~~~~~~~~~~~~~~~~~~~~~~~')
                    Debug('开始推送：' + uid)
                    Debug(content)

                    const pusher_success = pusher.sendWxPusher({
                        summary: summary,
                        uids: [uid],
                        content: content
                    })
                    Debug(`推送结果：${pusher_success.msg}`)
                }
            })
        }
        return false
    }

    const _userdata = getUserByIm()
    const uid = /.+/.test(_userdata.uid) ? _userdata.uid : false
    let dashboard
    if(/.+/.test(_userdata.password)){
        Debug(`获取用户账号成功：${_userdata.username},${_userdata.password}`)
        dashboard = new Dashboard(dashboard_host, _userdata.username, _userdata.password)
    }else{
        Debug('获取用户账号失败')
        dashboard = new Dashboard(dashboard_host)
    }
    if (!dashboard.success) return false
    const uinfo = dashboard.getDashboardInfo()

    //主菜单内容
    let main_text = uinfo.permission == 'User' ? '😊' : '💎' //🐶
    main_text += `欢迎使用 ${pluginName}，输入序号查询：\n（+ 登记，- 删除，a 通查，q 退出）`
    main_text += '\n======================\n'
    main_text += uinfo.cks.map((v, i) => { return `[${i + 1}]👑${v.elm_name}` }).join('\n')
    main_text += '\n======================\n'
    if (appToken) main_text += uid ? '🎉微信推送：已设置（w 修改）\n' : '❌微信推送：未设置（w 设置）\n'
    main_text += `🚗车位：${uinfo.used}/${uinfo.accredit}（p 充值）\n`
    main_text += `📆到期：${uinfo.deadline}`

    let admin_dashboard = false
    if (isAdmin()) { // 主菜单内容 - 管理员专区
        const admin = bucketGet('elmtool', 'admin');
        const password = bucketGet('elmtool', 'admin_pw');
        if (admin && password) {
            admin_dashboard = new AdminDashboard(dashboard_host, admin, password)
            if (!admin_dashboard) return false
            main_text += '\n~~~~~~~~~~~~~~~~~~~~~~'
            if (chatId == 0) {
                const sys_data = admin_dashboard.getAdminInfo()
                main_text += '\n系统信息：' + sys_data.sysinfo
                main_text += '\n授权码：' + sys_data.accreditCode[0].replace(/(?<=.{6}).{20}/, '****')
                main_text += '\n授权到期时间：' + sys_data.accreditTime
                main_text += '\n授权账号数量：' + sys_data.accreditNum
                main_text += '\n~~~~~~~~~~~~~~~~~~~~~~'
            }
            main_text += '\n💳 》》 x 批量更新x5sec'
            main_text += '\n💳 》》 f 发卡'
        }
    }

    //主菜单操作
    const main_select = ShuRu(main_text)
    if (main_select == '+') { // 添加账号
        Debug('----------- 添加账号 -----------')
        const cookie = ShuRu('请输入 cookie 或 手机号（q 退出）：');
        if (cookie == false) return false

        if (/^1[345789]\d{9}$/.test(cookie)) { //用户选择短信登录
            Debug('用户选择短信登录')

            const sms = dashboard.sms_send(cookie)
            if (sms.code == 200) {
                const smsCode = ShuRu('请输入验证码（q 退出）：')
                if (smsCode == false) return false
                if (/\d{6}/.test(smsCode) == false) return sendErr('格式错误')

                const sign = dashboard.sms_login(cookie, smsCode)
                return sendErr(sign.msg)
            } else {
                return sendErr(sms.msg)
            }
        } else { //用户选择cookie登录
            Debug('用户选择cookie登录')
            const remark = ShuRu('请输入备注（q 退出）：'); if (remark == false) return false
            return dashboard.add_cookie(cookie, remark)
        }
    } else if (/^\-\d+$/.test(main_select)) { // 删除账号
        Debug('----------- 删除账号 -----------')
        const no = +main_select.match(/(?<=\-)\d+/)[0]
        if (no == 0 || no > uinfo.cks.length) return sendErr('输入有误')
        const confirmed = ShuRu(`你将要删除账号 ${uinfo.cks[no - 1].elm_name}，继续请回复“y”:`)
        if (!confirmed) return false
        if (/^[yY]$/.test(confirmed)) {
            dashboard.delete_cookie(uinfo.cks[no - 1].task_id)
        } else {
            return sendErr('输入有误')
        }
    } else if (/^\d+$/.test(main_select)) { // 查询账号
        Debug('----------- 查询账号 -----------')
        const no = +main_select
        if (no == 0 || no > uinfo.cks.length) return sendErr('输入有误')
        const body = dashboard.query_cookie(uinfo.cks[no - 1].tool_id)
        const query_data = body.data

        let outmsg = ''
        let eidt_str = ''

        if (body.success) { // 存活ck
            // sendText('💼🌂🎈🎉🎀🎎🎏🎐🎁🎊✅❎❌⭕🔴💣📠💿🎛📷🎥🎚🔍🔎📲📹💰📍🔒💻📻📺📟💾📼📮📭📕📔📝🔔🔌📊🔋📇📑📦📄📃📖📈📉📩📨📒📧📓📙📫📪📗📬📡📯⏰🔮🔭🔬💴💷💶💸💵💳📤📥📜📏📌📐🖇📎📆📁📅🔖📰🚗🥇🥈🥉🎯🎬🏆')
            outmsg = `🎊查询成功：${uinfo.cks[no - 1].elm_name}\n`
            outmsg += `😊账号信息：${query_data.user_name ? query_data.user_name : '未设置昵称'}\n`
            outmsg += `📭账号ID：${query_data.user_id}\n`
            outmsg += `📞账号绑定手机号：${query_data.mobile}\n`
            outmsg += `📲是否为APPCK：${query_data.is_app_cookie ? '是' : '否'}\n`
            outmsg += `🥇乐园币总余额：${query_data.integral_property}\n`
            outmsg += `🥈乐园币今日收入：${query_data.today_property}\n`
            outmsg += `⏰CK过期时间：${query_data.expire_time}\n`

            eidt_str = '======================\n'
            eidt_str += '》t 查看任务日志\n'
            eidt_str += '》h 查看抢券日志\n'
            eidt_str += '》s 设置执行任务\n'
            eidt_str += '》e 编辑\n'
            eidt_str += '》q 退出\n'
        } else { // 失效CK
            outmsg = `❌${uinfo.cks[no - 1].elm_name}：${query_data}`
            eidt_str = '\n（e 编辑，q 退出）'
        }

        const ck_edit_select = ShuRu(outmsg + eidt_str)
        if (/^[tT]$/.test(ck_edit_select)) { //查看任务日志
            if (!body.success) return sendErr('输入有误')
            return dashboard.task_logs(uinfo.cks[no - 1].task_id)
        } else if (/^[hH]$/.test(ck_edit_select)) { //查看抢券日志
            if (!body.success) return sendErr('输入有误')
            return dashboard.exchange_logs(uinfo.cks[no - 1].tool_id)
        } else if (/^[sS]$/.test(ck_edit_select)) { //设置执行任务
            Debug('------- 设置执行任务 -------')
            if (!body.success) return sendErr('输入有误')
            const data = dashboard.query_cookie_setting(uinfo.cks[no - 1].tool_id)
            // Debug(JSON.stringify(data))
            const setdata = new Array()

            let task_setting_str = '============== 任务设置\n'
            task_setting_str += data.task_setting.map((v, i) => {
                v.bucket = 'task_setting'
                setdata.push(v)
                return `[${i + 1}]${v.title}：${typeof (v.value) == 'boolean' ? (v.value ? '✅' : '❌') : v.value}`
            }).join('\n')

            let setting_str = '\n============== 红包设置\n'
            setting_str += data.setting.map((v, i) => {
                v.bucket = 'setting'
                setdata.push(v)
                return `[${i + 1 + data.task_setting.length}]${v.title}：${typeof (v.value) == 'boolean' ? (v.value ? '✅' : '❌') : v.value}`
            }).join('\n')

            let refresh_token_str = '\n============== 自动续期\n'
            refresh_token_str += data.refresh_token.map((v, i) => {
                v.bucket = 'refresh_token'
                setdata.push(v)
                return `[${i + 1 + data.task_setting.length + data.setting.length}]${v.title}：${typeof (v.value) == 'boolean' ? (v.value ? '✅' : '❌') : v.value}`
            }).join('\n')

            let outstr = task_setting_str + setting_str + refresh_token_str
            outstr += '\n====================\n'
            outstr += '》请输入序号设置，","间隔（q 退出）：'

            const setting_select = ShuRu(outstr)
            if (/^[\d,]+$/.test(setting_select)) { // 序号选择
                // return sendErr('未开放')
                const select_ary = setting_select.split(',')

                Debug('用户更改设置：')
                // Debug(JSON.stringify(setdata))
                for (let i = 0; i < select_ary.length; i++) {
                    const index = select_ary[i] - 1

                    if (typeof (setdata[index].value) == 'boolean') {
                        setdata[index].value = !setdata[index].value
                    } else if (typeof (setdata[index].value) == 'string') {
                        const new_value = ShuRu(`请输入 ${setdata[index].title}（q 退出）：`)
                        if (new_value == false) {
                            return false
                        } else {
                            setdata[index].value = new_value
                        }
                    }
                    Debug(`[${index + 1}]${setdata[index].title}：${setdata[index].value}（${typeof (setdata[index].value)}）`)
                }

                // 表单格式化 - 字符串
                // const formData = new Object({
                //     task_setting:new Object({checkAll:true,reverseCheck:false}),
                //     setting:new Object(),
                //     refresh_token:new Object(),
                // })
                // setdata.forEach(item=>{
                //     formData[item.bucket][item.key] = item.value
                // })
                // const formStr = `id=${uinfo.cks[no-1].tool_id}&task_list=${JSON.stringify(formData.task_setting)}&coin_exchange=${formData.setting.coin_exchange}&coin_exchange_type=${formData.setting.coin_exchange_type}&coin_exchange_reset=${formData.setting.coin_exchange_reset}&refresh_token=${JSON.stringify(formData.refresh_token)}`
                // Debug('提交表单：'+encodeURI(formStr))
                // const updata = dashboard.update_cookie_setting(encodeURI(formStr))

                // 表单格式化 - 对象
                const formData = new Object({
                    id: uinfo.cks[no - 1].tool_id,
                    task_list: new Object({ checkAll: true, reverseCheck: false }),
                    coin_exchange: '',
                    coin_exchange_type: '',
                    coin_exchange_reset: '',
                    refresh_token: new Object()
                })
                setdata.forEach(item => {
                    switch (item.bucket) {
                        case 'task_setting':
                            formData.task_list[item.key] = item.value
                            break;
                        case 'setting':
                            formData[item.key] = item.value
                            break;
                        case 'refresh_token':
                            formData.refresh_token[item.key] = item.value
                            break;
                    }
                })
                formData.task_list = JSON.stringify(formData.task_list)
                formData.refresh_token = JSON.stringify(formData.refresh_token)
                // Debug('提交表单：'+JSON.stringify(formData))
                const updata = dashboard.update_cookie_setting(formData)

                return sendErr(updata.msg)
            } else if (setting_select == false) {
                return false
            } else {
                return sendErr('输入有误')
            }
        } else if (/^[eE]$/.test(ck_edit_select)) { //编辑
            const new_data = {
                task_id: uinfo.cks[no - 1].tool_id,
                new_task_time: uinfo.cks[no - 1].cron,
                new_cookie: '',
                remark: uinfo.cks[no - 1].elm_name
            }
            Debug('编辑: ' + JSON.stringify(new_data))
            let edit_msg = '修改账号\n======================'
            edit_msg += '\n[1]⏰任务执行时间：' + new_data.new_task_time
            edit_msg += '\n[2]🔒Cookie：-'
            edit_msg += '\n[3]😊备注：' + new_data.remark
            edit_msg += '\n======================'
            edit_msg += '\n* tips：任务执行时间无法修改'
            edit_msg += '\n》请输入序号编辑（q 退出）：'

            const edit_select = ShuRu(edit_msg)
            const key = ['new_task_time', 'new_cookie', 'remark'][edit_select - 1]
            Debug('编辑项: ' + key)
            if (edit_select == false) return false // 用户退出
            if (key == undefined) return sendErr('输入有误')

            const value = ShuRu('请输入新值（q 退出）：')
            if (!value) return false // 用户退出

            new_data[key] = value
            return dashboard.update_cookie(new_data)
        } else if (ck_edit_select == false) { //退出
            return false
        } else {
            return sendErr('输入有误')
        }
    } else if (/^[aA]$/.test(main_select)) { // 一键通查
        Debug('----------- 一键通查 -----------')
        if (Array.isArray(uinfo.cks)) {
            if (uinfo.cks.length) {
                const msg_1 = sendText('通查耗时较久，请稍等 ...')
                uinfo.cks.forEach(item => {
                    const body = dashboard.query_cookie(item.tool_id)
                    const query_data = body.data
                    let outmsg = ''

                    if (body.success) { // 存活ck
                        // sendText('💼🌂🎈🎉🎀🎎🎏🎐🎁🎊✅❎❌⭕🔴💣📠💿🎛📷🎥🎚🔍🔎📲📹💰📍🔒💻📻📺📟💾📼📮📭📕📔📝🔔🔌📊🔋📇📑📦📄📃📖📈📉📩📨📒📧📓📙📫📪📗📬📡📯⏰🔮🔭🔬💴💷💶💸💵💳📤📥📜📏📌📐🖇📎📆📁📅🔖📰🚗🥇🥈🥉🎯🎬🏆')
                        outmsg = `🎊查询成功：${item.elm_name}\n`
                        outmsg += `😊账号信息：${query_data.user_name ? query_data.user_name : '未设置昵称'}\n`
                        outmsg += `📭账号ID：${query_data.user_id}\n`
                        outmsg += `📞账号绑定手机号：${query_data.mobile}\n`
                        outmsg += `📲是否为APPCK：${query_data.is_app_cookie ? '是' : '否'}\n`
                        outmsg += `🥇乐园币总余额：${query_data.integral_property}\n`
                        outmsg += `🥈乐园币今日收入：${query_data.today_property}\n`
                        outmsg += `⏰CK过期时间：${query_data.expire_time}\n`
                    } else { // 失效CK
                        outmsg = `❌${item.elm_name}：${query_data}`
                    }
                    sendText(outmsg)
                })
                return RecallMessage(msg_1)
            }
        }
        return sendErr('请先添加账号')
    } else if (/^[wW]$/.test(main_select)) { // wxpusher
        Debug('----------- wxpusher -----------')
        if (pusher == false) return sendErr('未开启微信推送功能')
        const _uid = pusher.getNewid()

        if (typeof (_uid) == 'string') {
            setUserByIm({ uid: _uid })
            return sendRecall(`设置成功：\n${_uid}`)
        }

        return false
    } else if (/^[pP]$/.test(main_select)) { // 充值卡密
        Debug('----------- 充值卡密 -----------')
        const payCode = bucketGet('elmtool', 'payCode')
        const admin = bucketGet('elmtool', 'admin');
        const password = bucketGet('elmtool', 'admin_pw');
        if (payCode && admin && password) {
            const carmi = ShuRu('请输入你的卡密（v 扫码，q 退出）：')
            if (carmi == false) return false
            if (/^[vV]$/.test(carmi)) { // 扫码充值
                admin_dashboard = new AdminDashboard(dashboard_host, admin, password)
                if (!admin_dashboard) return false

                let payAccount = bucketGet('elmtool', 'payAccount'); if (!payAccount > 0) payAccount = 2;
                let payDuration = bucketGet('elmtool', 'payDuration'); if (!payDuration > 0) payDuration = 2;

                const select_pay = ShuRu(`请选择要充值的项目：\n1.增加车位（${payAccount}元/位）\n2.续费时间（${payDuration}元/30天）\n=================\n* tips：增加车位不会续费时间！`)
                if (select_pay == false) return false
                const carmi_type = ['account', 'duration'][select_pay - 1]
                if (typeof (carmi_type) != 'string') return sendErr('输入有误')

                const pay_money = pay([payAccount, payDuration][select_pay - 1], payCode)
                if (!pay_money) return false
                const qouta = Math.floor(pay_money / [payAccount, payDuration][select_pay - 1])
                if (qouta == 0) return sendErr(`收到 ${pay_money} 元，感谢您的捐赠`)

                const create_number = 1

                let pay_msg = '系统异常'
                if (carmi_type == 'account') pay_msg = `收到 ${pay_money} 元，将为您增加 ${qouta} 个车位`
                if (carmi_type == 'duration') pay_msg = `收到 ${pay_money} 元，将为您增加 ${qouta * 30} 天时间`
                pay_msg = sendText(pay_msg)

                const pay_carmi = admin_dashboard.carmi_create(carmi_type, carmi_type == 'duration' ? qouta * 30 : qouta, create_number)
                if (!pay_carmi) return RecallMessage(pay_msg)

                const pay_status = dashboard.recharge(pay_carmi[0])
                return RecallMessage(pay_msg)
            } else { // 卡密充值
                return dashboard.recharge(carmi)
            }
        } else { // 卡密充值
            const carmi = ShuRu('请输入你的卡密（q 退出）：')
            if (carmi == false) return false
            return dashboard.recharge(carmi)
        }
    } else if (/^[fF]$/.test(main_select)) { // 管理员发卡
        if (!isAdmin()) return sendErr('成为管理员真是泰裤辣')
        if (!admin_dashboard) return sendErr('未配置管理员账号')

        const select_1 = ShuRu('批量生成卡密\n======================\n请选择 生成类型（q 退出）：\n1.授权时间（天）\n2.授权数（个）')
        if (select_1 == false) return false
        const carmi_type = ['duration', 'account'][select_1 - 1]
        if (typeof (carmi_type) != 'string') return sendErr('输入有误')

        const qouta = ShuRu(`批量生成卡密\n======================\n请输入 生成额度（${['多少天', '多少个车位'][select_1 - 1]}，q 退出）：`)
        if (qouta == false) return false
        if (!/^\d+$/.test(qouta)) return sendErr('输入有误')

        const create_number = ShuRu(`批量生成卡密\n======================\n请输入 生成数量（多少个卡密，q 退出）：`)
        if (create_number == false) return false
        if (!/^\d+$/.test(create_number)) return sendErr('输入有误')

        const carmis = admin_dashboard.carmi_create(carmi_type, qouta, create_number)
        if (!carmis) return false
        return sendRecall('生成结果：\n' + carmis.join('\n'))
    } else if (/^[xX]$/.test(main_select)) { // 批量更新x5sec
        if (!isAdmin()) return sendErr('成为管理员真是泰裤辣')
        if (!admin_dashboard) return sendErr('未配置管理员账号')

        const x5sec = ShuRu('批量更新x5sec\n======================\n请选择输入 x5sec（q 退出）：')
        if (x5sec == false) return false

        const result = admin_dashboard.update_x5sec(x5sec)

        return sendErr(result.msg)
    } else if (main_select == false) { // 用户退出
        return false
    } else { // 输入错误
        sendText('输入有误')
    }
}

function Dashboard(host, username, password) {
    this.success = false
    let user = getUserByIm()
    if (typeof (username) == 'string' && typeof (password) == 'string') {
        user.username = username
        user.password = password
    }

    let isNew = false
    let isSignIn = false
    let headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    if (typeof (user.username) != 'string' || typeof (user.password) != 'string') {
        if (chatId > 0) return sendErr('未登录用户请私聊使用')
        isSignIn = ShuRu('未登录面板账号，请选择（q 退出）：\n1.登录\n2.注册')
        if (!isSignIn) return false
        if (!/[12]/.test(isSignIn)) return sendErr('输入有误')
        isNew = true
        user.username = ShuRu('请输入你的ELMTOOL账号（q 退出）：'); if (typeof (user.username) != 'string') return false;
        user.password = ShuRu('请输入你的ELMTOOL密码（q 退出）：'); if (typeof (user.password) != 'string') return false;
    }

    if (isSignIn == 2) { //注册
        if (!register(user.username, user.password)) return false
    }

    //登录
    const id_data = login(user.username, user.password)
    if (!id_data) return false
    this.success = true
    headers.Cookie = id_data.Cookie

    //新注册/登录写入用户数据
    if (isNew) {
        user.id = id_data.id
        setUserByIm(user)
        Debug('新建用户：' + user.id)
    }

    //检测wxpusher
    const wxpusher = pusher ? false : create_qrcode()

    this.getDashboardInfo = function () {
        // Debug('headers: '+JSON.stringify(headers))
        return request({
            headers: headers,
            url: host + '/dashboard',
            method: 'get',
        }, function (error, response) {
            // Debug(error)

            // host 错误链接失败，无法try
            // 【饿了么tool】运行错误：runtime error: invalid memory address or nil pointer dereference
            if (+response.statusCode != 200) return sendErr('ELMTOOL面板连接失败')

            // Debug('response: '+JSON.stringify(response.body))
            // Debug('body: '+JSON.stringify(body))
            //getElementById
            if (!JSON.stringify(response).includes('控制台')) return sendErr('面板cookie登录错误，请联系管理员处理')
            // Debug(JSON.stringify(response).includes('控制台'))

            const response_str = JSON.stringify(response)
            const permission = response_str.match(/mt\-1 small text\-muted\S+/)[0].match(/(?<=\>).*(?=\<)/)
            const daoqishijian = response_str.match(/\d{4}\-\d\d\-\d\d(?=[^<]+<\/div>[^>]+<div[^>]+>[^>]+账号到期时间)/)
            const yiyongpeie = response_str.match(/\d+(?=[^<]+<\/div>[^>]+<div[^>]+>[^>]+账号已用配额)/)
            const keyongpeie = response_str.match(/\d+(?=[^<]+<\/div>[^>]+<div[^>]+>[^>]+账号可用配额)/)

            const cks = new Array()
            const ckstrs = response_str.match(/editCookie(\([^\(]+){5}/g)
            if (Array.isArray(ckstrs)) ckstrs.forEach((element, i) => {
                const tool_id = element.match(/(?<=queryCookie\(.)\d+(?=.\))/)
                const task_id = element.match(/(?<=delCookie\(.)\w+(?=.\))/)
                const elm_name = element.match(/(?<=editCookie\('\d+',\s?'[\d\s\*,LW]+',\s?').+(?='\)..\>编辑)/)
                const cron = element.match(/(?<=editCookie\('\d+',\s?')[\d\s\*,LW]+(?=',)/)
                if (Array.isArray(elm_name) && Array.isArray(tool_id) && Array.isArray(task_id)) {
                    cks.push({ elm_name: elm_name[0], tool_id: tool_id[0], task_id: task_id[0], cron: cron[0] })
                }
                // sendText(`[${tool_id}]👑${elm_name}，任务ID：${task_id}`)
            });
            // sendText('到期：'+daoqishijian+'，配额：'+yiyongpeie +'/'+keyongpeie)
            // const deadline = response.match(/<div class="col"><div class="font-weight-medium">/)
            return { permission: permission[0], deadline: daoqishijian[0], accredit: keyongpeie[0], used: yiyongpeie[0], cks: cks }
        })
    }

    this.recharge = function (carmi) {
        // "code": 400,
        // "data": null,
        // "msg": "充值失败，卡密不存在"

        // 车位/续期 返回相同
        // "code": 200,
        // "data": {},
        // "msg": "充值成功"

        // "code": 400,
        // "data": null,
        // "msg": "充值失败，卡密已被使用"

        return request({
            url: host + '/dashboard/recharge',
            method: 'post',
            headers: headers,
            formData: {
                carmi: carmi
            },
            dataType: "json",
            timeOut: errTime * 1000
        }, function (error, response) {
            //连接错误
            if (error) return sendErr('充值卡密A：\n' + error)
            if (+response.statusCode != 200) return sendErr('充值卡密失败B：')

            //面板返回错误
            Debug('充值账号结果：' + JSON.stringify(response.body))
            if (response.body.code != 200) return sendErr(`C：${response.body.msg}`)

            return sendRecall(response.body.msg)
        })
    }

    this.query_cookie_setting = function (id) { //设置查询
        const titles = {
            "task_setting": {
                "basic_task": '基础任务',
                "idiom_game": '成语闯关',
                "eliminate_game": '饿了个饿',
                "water_sort_game": '欢乐倒水',
                "dream_courtyard": '厨神小当家',
                "magic_cube_game": '福尔魔方',
                "speed_linkup": '美味天天连',
                "food_stall_game": '经验美食摊',
                "sweet_compose_game": '合成甜蜜蜜',
                "compose_2048_game": '2048超级大招',
                "duo_bao_lucky": '幸运夺宝',
                "orchard_game": '果园任务',
                "orchard_game_auto_water": '果园浇水',
                "dream_courtyard_game": '梦幻小院',
                "checkAll": "全选",
                "reverseCheck": "反选",
                "yly_sign": "游乐园签到",
                "shop_sign": "超市签到",
                "yly_lottery": "游乐园抽奖",
                "yly_home_task": "游乐园首页任务",
                "association_sign": "社群打卡"
            },
            "setting": {
                "coin_exchange": '是否开启抢兑',
                "coin_exchange_type": "抢兑红包金额",
                "coin_exchange_reset": '每日重置抢兑'
            },
            "refresh_token": {
                "refresh_token": '是否开启Cookie自动续期',
                "refresh_token_setting": "刷新Token"
            }
        }

        return request({
            url: host + '/dashboard/query_cookie_setting',
            method: 'post',
            headers: headers,
            formData: {
                id: id
            },
            dataType: "json",
            timeOut: errTime * 1000
        }, function (error, response) {
            //连接错误
            if (error) return sendErr('设置查询失败A：\n' + error)
            if (+response.statusCode != 200) return sendErr('设置查询失败B：')

            //面板返回错误
            Debug('设置查询结果：' + response.body.code)
            if (response.body.code != 200) return sendErr(`设置查询失败C：${response.body.msg}`)

            //格式化结果
            const data = new Object()
            for (let a in response.body.data.data) {
                data[a] = new Array()
                const _d = JSON.parse(response.body.data.data[a])
                for (let b in _d) {
                    const key = b
                    const value = _d[b]
                    const title = titles[a][b]
                    // Debug('['+a+']'+key+', '+value+', '+title)
                    if (key != 'checkAll' && key != 'reverseCheck') { // 跳出“全选”、“反选”
                        data[a].push({ key: key, value: value, title: title })
                    }
                }
            }
            return data
        })
    }

    this.update_cookie_setting = function (formData) { //提交设置
        // Debug('提交设置')
        return request({
            url: host + '/dashboard/update_cookie_setting',
            method: 'post',
            headers: headers,
            formData: formData,
            dataType: "json",
            timeOut: errTime * 1000
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            //连接错误
            if (error) return sendErr('提交设置失败A：\n' + error)
            if (+response.statusCode != 200) return sendErr('提交设置失败B：')

            //面板返回错误
            Debug('提交设置结果：' + response.body.msg)
            if (response.body.code != 200) return sendErr(`提交设置失败C：${response.body.msg}`)

            return response.body
        })
    }

    this.task_logs = function (task_id) { //任务查询
        return request({
            url: host + '/dashboard/task/task_logs',
            method: 'post',
            headers: headers,
            formData: {
                task_id: task_id
            },
            dataType: "json",
            timeOut: errTime * 1000
        }, function (error, response) {
            //连接错误
            if (error) return sendErr('任务查询失败A：\n' + error)
            if (+response.statusCode != 200) return sendErr('任务查询失败B：')

            //面板返回错误
            Debug('任务查询结果：' + JSON.stringify(response.body))
            if (response.body.code != 200) return sendErr(`任务查询失败C：${response.body.msg}`)

            const log = response.body.data.data.log
            log_ary = log.split('\n')
            let log_str_ary = ['执行日志\n======================\n']
            log_ary.forEach((v, i) => {
                if (v) {
                    if (log_str_ary[Math.floor(i / 30)]) {
                        log_str_ary[Math.floor(i / 30)] += v + '\n'
                    } else {
                        log_str_ary[Math.floor(i / 30)] = v + '\n'
                    }
                }
            })

            log_str_ary[log_str_ary.length - 1] += '\n======== End ========='
            log_str_ary.forEach(item => {
                sendText(item)
            })
            return true
        })
    }

    this.exchange_logs = function (id) { //抢券查询
        return request({
            url: host + '/dashboard/task/exchange_logs',
            method: 'post',
            headers: headers,
            formData: {
                id: id
            },
            dataType: "json",
            timeOut: errTime * 1000
        }, function (error, response) {
            //连接错误
            if (error) return sendErr('抢券查询失败A：\n' + error)
            if (+response.statusCode != 200) return sendErr('抢券查询失败B：')

            //面板返回错误
            Debug('抢券查询结果：' + JSON.stringify(response.body))
            if (response.body.code != 200) return sendErr(`抢券查询失败C：${response.body.msg}`)

            return sendRecall('抢兑日志\n======================\n' + response.body.data.data.exchange_logs.replace(/\[(?=\d{4})/g, '⏰\[').replace(/(?<=\.\d+)\]/g, '\]\n📃'))
        })
    }

    this.add_cookie = function (cookie, remark) { // 添加ck
        let task_time = Math.floor(Math.random() * 58 + 1).toString() + ' '
        task_time += Math.floor(Math.random() * 58 + 1).toString() + ' '
        task_time += Math.floor(Math.random() * 10 + 1).toString() + ','
        task_time += Math.floor(Math.random() * 10 + 1 + 12).toString() + ' * * *'
        sendErr('任务定时：' + task_time)

        return request({
            url: host + '/dashboard/add_cookie',
            method: 'post',
            headers: headers,
            formData: {
                task_time: task_time,
                cookie: cookie,
                remark: remark
            },
            dataType: "json",
            timeOut: errTime * 1000
        }, function (error, response) {
            //连接错误
            if (error) return sendErr('添加失败A：\n' + error)
            if (+response.statusCode != 200) return sendErr('添加失败B：')

            //面板返回错误
            Debug('添加账号结果：' + JSON.stringify(response.body))
            if (response.body.code != 200) return sendErr(`添加失败C：${response.body.msg}`)

            return sendRecall(response.body.msg)
        })
    }

    this.delete_cookie = function (task_id) { // 删除 ck
        return request({
            url: host + '/dashboard/delete_cookie',
            method: 'post',
            headers: headers,
            formData: {
                task_id: task_id
            },
            dataType: "json",
            timeOut: errTime * 1000
        }, function (error, response) {
            //连接错误
            if (error) return sendErr('删除失败A：\n' + error)
            if (+response.statusCode != 200) return sendErr('删除失败B：')

            //面板返回错误
            Debug('删除账号结果：' + JSON.stringify(response.body))
            if (response.body.code != 200) return sendErr(`删除失败C：${response.body.msg}`)

            // sendText(JSON.stringify(response.body))
            return sendRecall(response.body.msg)
        })
    }

    this.update_cookie = function (data = { task_id, new_cookie, new_task_time, remark }) {
        return request({
            url: host + '/dashboard/update_cookie',
            method: 'post',
            headers: headers,
            formData: data,
            dataType: "json",
            timeOut: errTime * 1000
        }, function (error, response) {
            //连接错误
            if (error) return sendErr('编辑失败A：\n' + error)
            if (+response.statusCode != 200) return sendErr('编辑失败B：')

            //面板返回错误
            Debug('编辑账号结果：' + JSON.stringify(response.body))
            if (response.body.code != 200) return sendErr(`编辑失败C：${response.body.msg}`)

            // sendText(JSON.stringify(response.body))
            return sendRecall(response.body.msg)
        })
    }

    this.query_cookie = function (id) {
        return request({
            url: host + '/dashboard/query_cookie',
            method: 'post',
            headers: headers,
            formData: {
                id: id
            },
            dataType: "json",
            timeOut: errTime * 1000
        }, function (error, response) {
            //连接错误
            if (error) return sendErr('查询失败A：\n' + error)
            if (+response.statusCode != 200) return sendErr('查询失败B：')

            //面板返回错误
            Debug('基础查询结果：' + response.body.msg)
            if (response.body.code != 200) return sendErr(`查询失败C：${response.body.msg}`)

            // if(!response.body.data.success) return sendErr('查询失败D：'+response.body.data.data)
            return response.body.data
        })
    }

    /** 发送短信
     * @param {int} phoneNumber 
     * @returns {body}
     */
    this.sms_send = function (phoneNumber) {
        return request({
            url: host + '/dashboard/api/1.0/sms_send',
            method: 'post',
            headers: headers,
            formData: {
                phoneNumber: phoneNumber
            },
            dataType: "json",
            timeOut: errTime * 1000
        }, function (error, response) {
            //连接错误
            if (error) return sendErr('发送短信失败A：\n' + error)
            Debug(response.body.msg)

            if (+response.statusCode != 200) return sendErr('发送短信失败B：\n' + JSON.stringify(response.body))

            //面板返回错误
            if (+response.body.code != 200) return sendErr(`发送短信失败C：${response.body.msg}`)

            //发送成功
            return response.body
        })
    }

    /** 短信验证登录
     * @param {int} phoneNumber 
     * @param {int} smsCode 
     * @returns {body}
     */
    this.sms_login = function (phoneNumber, smsCode) {
        return request({
            url: host + '/dashboard/api/1.0/sms_login',
            method: 'post',
            headers: headers,
            formData: {
                phoneNumber: phoneNumber,
                smsCode: smsCode
            },
            dataType: "json",
            timeOut: errTime * 1000
        }, function (error, response) {
            //连接错误
            if (error) return sendErr('短信验证失败A：\n' + error)

            Debug(response.body.msg)
            if (+response.statusCode != 200) return sendErr('短信验证失败B：\n' + JSON.stringify(response.body))

            //面板返回错误
            //验证码位数错误： {"status":200,"statusCode":200,"body":{"code":400,"data":null,"msg":"验证码错误"},"header":{}}
            if (+response.body.code != 200) return sendErr(`短信验证失败C：${response.body.msg}`)

            //短信验证成功
            return response.body
        })
    }

    function login(username, password) {
        // HTTP ERROR 502 无法 try/catch
        // autMan 报错 js插件【饿了么K】运行错误：runtime error: invalid memory address or nil pointer dereference
        return request({
            url: host + '/login',
            method: 'post',
            headers: headers,
            formData: {
                username: username,
                password: password
            },
            dataType: "json",
            timeOut: errTime * 1000
        }, function (error, response, body) {
            //连接错误
            if (error) return sendErr('面板连接失败A：\n' + error)
            if (+response.statusCode != 200) return sendErr('面板连接失败B：')

            //面板返回错误
            if (+response.body.code != 200) return sendErr(response.body.code + '，' + response.body.msg)

            if (!response.body.data.id) return sendErr('获取面板用户ID失败，请联系管理员处理')
            if (!body['Set-Cookie']) return sendErr('获取面板用户Cookie失败1，请联系管理员处理')
            // Debug('response: '+JSON.stringify(response))
            // Debug('body: '+JSON.stringify(body))
            // Debug('body: '+body['Set-Cookie'].toString())
            const _c = body['Set-Cookie'].toString().match(/_ElmTool_SESSION=[\w=\-]+(?=;)/g)
            if (!Array.isArray(_c)) return sendErr('获取面板用户Cookie失败2，请联系管理员处理')
            return { ...response.body.data, ...{ Cookie: _c[_c.length - 1] } }
        })
    }

    function register(username, password) {
        return request({
            url: host + '/register',
            method: 'post',
            headers: headers,
            formData: {
                username: username,
                password: password,
                repassword: password
            },
            dataType: "json",
            timeOut: errTime * 1000
        }, function (error, response) {
            //连接错误
            if (error) return sendErr('注册失败A：\n' + error)
            if (+response.statusCode != 200) return sendErr('注册失败B：')

            //面板返回错误
            if (+response.body.code != 200) return sendErr(`注册失败C：${response.body.msg}`)

            //注册成功
            sendText(response.body.msg)
            return response.body.data
        })
    }

    function create_qrcode() {
        return request({
            url: host + '/dashboard/message/create_qrcode',
            method: 'post',
            headers: headers,
            // formData:{},
            // dataType: "json",
            timeOut: errTime * 1000
        }, function (error, response) {
            //连接错误
            if (error) return sendErr('获取wxpusher二维码失败A：\n' + error)
            if (+response.statusCode != 200) return sendErr('获取wxpusher二维码失败B：')

            //面板返回错误
            // Debug('create_qrcode_response.body: '+response.body)
            // Debug('body: '+JSON.stringify(body))
            const body = JSON.parse(response.body)
            // const data = JSON.parse(body.data)
            // sendText(JSON.stringify(body.data.data))

            //账号已绑定UID
            // Debug(body.msg)
            if (body.code == 400) return true

            //面板获取wxpusher状态失败
            if (body.code != 200) return sendErr(`获取wxpusher二维码失败C：${response.body.msg}`)

            //未绑定UID，发送二维码
            sendText('请使用微信扫码关注应用：' + image(body.data.data.qrUrl))

            return false
        })
    }

    return this
}

function AdminDashboard(host, username, password) {
    //登录
    let headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    const id_data = login(username, password)
    if (!id_data) return false
    this.success = true
    headers.Cookie = id_data.Cookie

    this.getAdminInfo = function () { // 获取配置中心信息
        return request({
            url: host + '/dashboard/setting',
            method: 'get',
            headers: headers,
            dataType: "text",
            timeOut: errTime * 1000
        }, function (error, response) {
            //连接错误
            if (error) return sendErr('获取系统信息失败A：\n' + error)
            if (+response.statusCode != 200) return sendErr('获取系统信息失败B：')

            // Debug('获取系统信息结果：'+JSON.stringify(response.body))

            const data = {
                sysinfo: response.body.match(/(?<=系统信息\[)[\d\.]+(?=\]\<)/),
                accreditCode: response.body.match(/(?<=授权码：)\w+(?=\n)/),
                accreditTime: response.body.match(/(?<=授权到期时间：).+(?=\n)/),
                accreditNum: response.body.match(/(?<=授权账号数量：)\d+\/\d+(?=\n)/),
            }
            Debug('获取系统信息结果：' + JSON.stringify(data))
            return data
        })
    }

    /**
     * 生成卡密
     * @param {string} carmi_type 生成类型 - account：授权数（个）；duration：授权时间（天）
     * @param {int} qouta 生成额度 - 多少个车位 / 多少天
     * @param {int} create_number 生成数量 - 生成多少个卡密
     * @returns 
     */
    this.carmi_create = function (carmi_type, qouta, create_number) { // 生成卡密
        return request({
            url: host + '/dashboard/carmi/create',
            method: 'post',
            headers: headers,
            formData: {
                carmi_type: carmi_type,
                qouta: qouta,
                create_number: create_number
            },
            dataType: "json",
            timeOut: errTime * 1000
        }, function (error, response) {
            //连接错误
            if (error) return sendErr('生成卡密失败A：\n' + error)
            if (+response.statusCode != 200) return sendErr('生成卡密失败B：')

            //面板返回错误
            Debug('生成卡密结果：' + JSON.stringify(response.body))
            if (response.body.code != 200) return sendErr(`生成卡密失败C：${response.body.msg}`)

            // sendText(JSON.stringify(response.body))
            return response.body.data.data
        })
    }

    /** 批量更新x5sec
     * @param {string} x5sec
     * @returns 
     */
    this.update_x5sec = function (x5sec) {
        return request({
            url: host + '/dashboard/setting/update_x5sec',
            method: 'post',
            headers: headers,
            formData: {
                x5sec: x5sec
            },
            dataType: "json",
            timeOut: errTime * 1000
        }, function (error, response) {
            //连接错误
            if (error) return sendErr('批量更新x5sec失败A：\n' + error)
            if (+response.statusCode != 200) return sendErr('批量更新x5sec失败B：')

            //面板返回错误
            if (response.body.code != 200) return sendErr(`批量更新x5sec失败C：${response.body.msg}`)
            Debug('批量更新x5sec结果：' + response.body.msg)

            // sendText(JSON.stringify(response.body))
            return response.body
        })
    }

    function login(username, password) {
        // HTTP ERROR 502 无法 try/catch
        // autMan 报错 js插件【饿了么K】运行错误：runtime error: invalid memory address or nil pointer dereference
        return request({
            url: host + '/login',
            method: 'post',
            headers: headers,
            formData: {
                username: username,
                password: password
            },
            dataType: "json",
            timeOut: errTime * 1000
        }, function (error, response, body) {
            //连接错误
            if (error) return sendErr('管理员面板连接失败A：\n' + error)
            if (+response.statusCode != 200) return sendErr('管理员面板连接失败B：')

            //面板返回错误
            if (+response.body.code != 200) return sendErr(response.body.code + '，' + response.body.msg)

            if (!response.body.data.id) return sendErr('获取管理员ID失败')
            if (!body['Set-Cookie']) return sendErr('获取管理员Cookie失败1')
            // Debug('response: '+JSON.stringify(response))
            // Debug('body: '+JSON.stringify(body))
            // Debug('body: '+body['Set-Cookie'].toString())
            const _c = body['Set-Cookie'].toString().match(/_ElmTool_SESSION=[\w=\-]+(?=;)/g)
            if (!Array.isArray(_c)) return sendErr('获取管理员Cookie失败2')
            return { ...response.body.data, ...{ Cookie: _c[_c.length - 1] } }
        })
    }

    return this
}

function WxPusher(appToken) {
    const validTime = 90 // 二维码有效时间（秒）
    const time = 15 // 二维码检测间隔

    /** 引导用户关注并获取UID
     * @returns {uid|false} 返回UID或false
     */
    this.getNewid = function () {
        const { code, url } = getQR()
        if (typeof (code) != 'string') return false
        Debug(`获取wxpusher二维码：${url}`)

        const auturl = url ? autImg(url) : false
        if (auturl == false) return false

        const msg = sendText(`请在 ${inputTime} 秒内使用微信扫码关注应用（q 退出）：${image(auturl)}`)
        for (let i = time; i < validTime; i += time) {
            const quit = input(time * 1000, 3000)
            const status = checkQR(code)

            // 1001，暂无用户扫描二维码
            // 1000，处理成功
            Debug(`wxpusher：${status.code}${status.msg}`)
            if (status.success) {
                RecallMessage(msg)
                return status.data
            } else if (quit == 'q' || quit == 'Q') {
                RecallMessage(msg)
                return sendErr('已退出')
            } else {
                continue
            }
        }
        RecallMessage(msg)
        Debug(`wxpusher：超时`)
        return sendErr('超时')
    }

    /**获取 wxpusher 二维码
     * @returns {data|false} 返回QR对象或false
     */
    function getQR() {
        const url = 'https://wxpusher.zjiecode.com/api/fun/create/qrcode'
        const extra = {}
        extra[imType] = userId
        return request({
            url: url,
            method: 'post',
            body: {
                appToken: appToken,
                extra: JSON.stringify(extra),
                validTime: validTime
            }
        }, function (error, response) {
            if (error) return sendErr(error)
            if (response.statusCode != 200) return sendErr('wxpusher二维码获取失败A')
            // Debug(response.body)

            const body = JSON.parse(response.body)
            if (!body.success) return sendErr('wxpusher二维码获取失败B\n' + body.msg)

            // Debug(JSON.stringify(body.data))
            // {"expires":16994300...,"code":"bWtRkvAZZd...","shortUrl":"http://wxpush....jpg","extra":"{\"wx\":\"Liksbe\"}","url":"http://wxpush....jpg"}
            return body.data
        })
    }

    /** 检测 wxpusher */
    function checkQR(code) {
        const url = 'https://wxpusher.zjiecode.com/api/fun/scan-qrcode-uid'

        return result = request({
            url: url + '?code=' + code,
            method: 'get'
        }, function (error, response) {
            if (error) return false
            if (response.statusCode != 200) return false

            // Debug(response.body)
            return JSON.parse(response.body)
        })
    }

    /** 发送WXPUSHER消息
     * @param {*} data 
     * @returns 
     */
    this.sendWxPusher = function (data) {
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
            // Debug('checkWxPusher: '+JSON.stringify(response))
            if (error) return false
            if (response.statusCode != 200) return false

            return JSON.parse(response.body)
        })
    }

    return this
}

function getUsers() {
    let userBuck = bucketGet('elmtool', 'user')

    //用户桶初始化
    if (!userBuck || userBuck == '') {
        return new Array()
    } else {
        try {
            if (typeof (userBuck) == 'string') return JSON.parse(userBuck)
        } catch (e) {
            return sendErr('用户im数据错误：\n' + e)
        }
    }
}

function getUserByID(data) {
    // sendText(JSON.stringify(data))
    let userBuck = bucketGet('elmtool', 'user')

    //用户桶初始化
    if (!userBuck || userBuck == '') {
        userBuck = new Array()
    } else {
        try {
            if (typeof (userBuck) == 'string') userBuck = JSON.parse(userBuck)
        } catch (e) {
            return sendErr('用户id数据错误：\n' + e)
        }
    }

    //查找用户
    let user = userBuck.filter(item => {
        return item.id == data.id
    })
    if (user.length) { //返回旧用户
        // sendText('返回旧用户')
        let isChange = false
        userBuck = userBuck.map(element => {
            let _d = element
            if (element.id == user[0].id) {
                isChange = true
                _d = { ...element, ...data }
                // sendText('element: '+JSON.stringify(_d))
            }
            return _d
        });
        // sendText('userBuck: '+JSON.stringify(userBuck))
        if (!isChange) return sendErr('插件异常1')
    } else { //返回新建用户
        const _u = userBuck.filter(item => {
            return item[imType] == userId
        })

        if (_u.length) {
            // sendText('写入旧IM')
            let isChange = false
            userBuck = userBuck.map(element => {
                let _d = element
                if (element[imType] == userId) {
                    isChange = true
                    _d = { ...element, ...data }
                }
                // sendText('element: '+JSON.stringify(_d))
                return _d
            });
            if (!isChange) return sendErr('插件异常2')
        } else {
            // sendText('写入新IM')
            userBuck.push(data)
        }
    }

    //写入用户数据
    // sendText('userBuck: '+JSON.stringify(userBuck))
    // bucketSet('elmtool','user',JSON.stringify(userBuck))

    return user
}

function getUserByIm() {
    let userBuck = bucketGet('elmtool', 'user')

    //用户桶初始化
    if (!userBuck || userBuck == '') {
        userBuck = new Array()
    } else {
        try {
            if (typeof (userBuck) == 'string') userBuck = JSON.parse(userBuck)
        } catch (e) {
            return sendErr('用户im数据错误：\n' + e)
        }
    }

    //获取/初始化用户信息
    let user = userBuck.filter(item => {
        return item[imType] == userId
    })
    if (user.length) { //返回旧用户
        // sendText(JSON.stringify(user[0]))
        return user[0]
    } else { //返回新建用户
        const _u = new Object()

        _u[imType] = userId

        //写入新用户数据
        // userBuck.push(_u)
        // bucketSet('elmtool','user',JSON.stringify(userBuck))

        return _u
    }
}

function setUserByIm(data) {
    Debug(`写入数据：${JSON.stringify(data)}`)
    let userBuck = bucketGet('elmtool', 'user')

    //用户桶初始化
    if (!userBuck || userBuck == '') {
        userBuck = new Array()
    } else {
        try {
            if (typeof (userBuck) == 'string') userBuck = JSON.parse(userBuck)
        } catch (e) {
            return sendErr('用户im数据错误：\n' + e)
        }
    }

    let isFind = false
    userBuck = userBuck.map(item => {
        if (item[imType] == userId) {
            item = { ...item, ...data }
            isFind = true
            Debug(`${userId} 更新用户数据：${JSON.stringify(item)}`)
        }
        return item
    })

    if (isFind == false) {
        data[imType] = userId
        userBuck.push(data)
        Debug(`${userId} 新建用户数据：${JSON.stringify(data)}`)
    }

    // Debug(JSON.stringify(userBuck))
    bucketSet('elmtool', 'user', JSON.stringify(userBuck))

    return userBuck
}

// 文本转html
function str2html(text) {
    // Debug('text: '+text)
    let outStr = '<style> table { border-collapse: collapse; background-color: lightblue; border: 1px solid grey; } td { border: 1px solid grey; text-align: left; vertical-align: middle; padding-left: 1ch; } .fixed-width { width: 14ch; } .fixed-width-large { width: 18ch; } </style>'
    outStr += '<table><tbody>'

    // 分割文本为行
    var lines = text.split('\n');

    // let rowspan = 1
    let outStr2 = ''
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('：')) {
            const [tag, msg] = lines[i].split('：')
            outStr2 += '<tr>'
            outStr2 += `<td class="fixed-width">${tag}</td>`
            outStr2 += `<td class="fixed-width-large">${msg}</td>`
            outStr2 += '</tr>'

            // rowspan++
        }
    }

    // outStr += `<tr><th rowspan="${rowspan}" class="center-img" align="middle"><img src="${img}" alt="用户头像加载失败" style="width:250px"></img></th></tr>`
    outStr += outStr2
    outStr += '<p>'

    outStr += '</tbody></table>'
    return outStr
}

/** 网图转autman一分钟图床
 * @param {图片地址} url 
 * @returns {autman图床地址} url 
 */
function autImg(url) {
    if (imType != 'qb') { Debug(`使用原始图片：${url}`); return url }

    const img = imageDownload(url, './qrcode.png')//下载到默认路径,url支持http路径，支持base64://路径，支持data:image
    // Debug('test: '+JSON.stringify(img))
    if (img['success']) {
        const username = bucketGet("cloud", "username")
        const password = bucketGet("cloud", "password")
        // sendImage(img['base64'].replace('data:image/png;base64,','base64://'))
        const ib = encodeURIComponent(img["base64"]);
        const body = request({
            url: "http://aut.zhelee.cn/imgUpload",
            method: "post",
            dataType: "json",
            formData: {
                username: username,
                password: password,
                imgBase64: ib
            },
        })
        // Debug(JSON.stringify(body))
        if (body.code === 200) {
            Debug(`使用aut图床：${body.result.path}`)
            return body.result.path
        } else {
            return sendErr('获取 WxPusher 二维码失败')
        }
    }
}

/** 用户支付 */
function pay(pay_money, pay_img) {
    if (atWaitPay()) {
        sendErr('支付系统繁忙，请稍后重试')
    } else {
        const msg = sendText(`请在 ${inputTime} 秒内使用微信扫码支付 ${pay_money} 元（可按整倍充值，非整倍余数将视为捐赠。q 退出）：${image(autImg(pay_img))}`)
        const quit = 'q'
        const pay = waitPay(inputTime * 1000, quit)

        RecallMessage(msg)

        if (pay == quit) return sendErr('取消支付')
        if (pay == 'timeout') return sendErr('超时退出')

        notifyMasters(`收款时间：${pay.time}\n收款类型：${pay.type}\n收款来源：${pay.fromName}\n收款金额：${pay.money}\n\n \n     --- 饿了么K by Jusbe`)
        return pay.money
    }
}

/** 错误提示
 * @description 
 * @param {提示内容} tap
 * @returns {false} false
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

main()
Debug('================== end ==================')