// [title: 微信朋友圈]
// [class: 工具类]
// [version: 0.0.2]
// [price: 2]
// [rule: ^(朋友圈)(测试)$]
// [cron: 33 * * * *]
// [bypass: false]
// [priority: 1]
// [public: true]
// [admin: true]
// [disable: false]
// [platform: wx，仅限西瓜平台使用]
// [author: jusbe]
// [service: Jusbe]
// [description: 命令》无，自行设置 插件定时<br>描述》朋友圈点赞、评论</br></br>首发：20240124]
// [param: {"required":false,"key":"juspyq.duplication","bool":true,"placeholder":"","name":"重复操作","desc":"不勾选则：每人每天仅 点赞/评论 一次"}]
// [param: {"required":false,"key":"juspyq.like","bool":true,"placeholder":"","name":"是否点赞","desc":""}]
// [param: {"required":false,"key":"juspyq.likeWhite","bool":false,"placeholder":"此功能还未开放","name":"点赞白名单","desc":"留空则点赞所有人"}]
// [param: {"required":false,"key":"juspyq.comment","bool":false,"placeholder":"","name":"评论内容","desc":"留空则不评论，高危操作，封号率无限接近100%"}]
// [param: {"required":false,"key":"juspyq.commentWhite","bool":false,"placeholder":"此功能还未开放","name":"评论白名单","desc":"留空则评论所有人"}]
// [param: {"required":false,"key":"juspyq.nothifies","bool":false,"placeholder":"如：qqindiv:123,qqgroup:456,wxgroup:789,tbgroup:111,qbgroup:333","name":"额外通知","desc":"留空默认仅通知管理员结果</br>格式：qqindiv:123,qqgroup:456,wxgroup:789"}]

const pluginName = getTitle()
const userid = GetUserID()
const imType = GetImType();
const param1 = param(1);
const param2 = param(2);

Debug(`<div style="text-align: center; font-size: 72px; font-weight: bold;">${pluginName}</div>`)

try {
    importJs('jusapi.js')
    const jv = jusapi.test_version("0.1.1")
    if (!jv.success) throw new Error(`【${pluginName}】插件 jusapi 需更新至：${jv.data}+\n .`)
} catch (e) {
    throw new Error(`【${pluginName}】请在插件市场安装“jusapi”\n .`);
}

const xyo_host = bucketGet("wx", "vlw_addr")
const xyo_token = bucketGet("wx", "vlw_token")
const robot_wxid = bucketGet("wx", "robot_wxid")
const xyos = new xyo(xyo_host, xyo_token, robot_wxid);
if (!(xyos.success)) throw new Error(`【${pluginName}】西瓜框架连接失败`)

const pusher = jusapi.pusher(bucketGet("juspyq", "nothifies"))

rebug(imType)
if (imType == 'fake' || param2 == '测试') {
    const duplication = bucketGet("juspyq", "duplication") == 'true'; rebug((duplication ? "未" : "已") + "开启去重")
    const like = bucketGet("juspyq", "like") == 'true'; rebug((like ? "已" : "未") + "开启点赞")
    const comment = bucketGet("juspyq", "comment"); rebug((comment ? "已" : "未") + "设置点赞内容")

    const pyq = xyos.GetMoments()

    rebug("读取ID列表")
    let ids = bucketGet("juspyq", "ids").split(',')

    let users
    if (+call("timeFormat")("HH")) {
        rebug("读取用户列表")
        users = bucketGet("juspyq", "users").split(',')
    } else {
        rebug("刷新用户列表")
        users = new Array()
    }

    pyq.ReturnJson.pyq_list.forEach(v => {
        const { pyq_id, nickname, username } = v

        if (!duplication && users.includes(username)) return rebug(`${username} 已操作过，本次不执行`)
        if (ids.includes(pyq_id)) return rebug(`${pyq_id} 已操作过，本次不执行`)

        const MomentsLike = like ? xyos.MomentsLike(pyq_id).Result : "未开启点赞"
        const MomentsComment = comment ? xyos.MomentsComment(pyq_id, comment).Result : "未设置评论"

        rebug(`${nickname}，点赞：${MomentsLike}，评论：${MomentsComment}`)
        notifyMasters(pusher.push(`【${pluginName}】${nickname}\n点赞：${MomentsLike}，评论：${MomentsComment}`))

        if (!users.includes(username)) users.push(username)
        bucketSet("juspyq", "users", users.join(","))

        ids.push(pyq_id); if (ids.length > 10) ids = ids.shift()
        bucketSet("juspyq", "ids", ids.join(","))
    })
}
