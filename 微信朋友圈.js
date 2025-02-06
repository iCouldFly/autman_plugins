// [title: 微信朋友圈]
// [class: 工具类]
// [version: 0.0.3 修复找不到jusapi]
// [price: 2]
// [rule: ^(朋友圈)(测试)$]
// [cron: 33 * * * *]
// [bypass: false]
// [priority: 1]
// [public: true]
// [admin: true]
// [disable:true]
// [platform: wx，仅限西瓜平台使用]
// [open_source: true]是否开源
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
// const content = GetContent()

Debug(`<div style="text-align: center; font-size: 72px; font-weight: bold;">${pluginName}</div>`)

try {
    importJs('jusapi.js')
    Debug("加载旧板 jusapi")
} catch (e) {
    Debug("未找到旧板 jusapi ，尝试查找新版")
    try {
        importJs('jusbe:jusapi.js')
        Debug("新版 jusapi 加载成功")
    } catch (e) {
        Debug("新版也没找到")
        throw new Error('请在插件市场安装“jusapi”');
    }
}

const xyo_host = bucketGet("wx", "vlw_addr")
const xyo_token = bucketGet("wx", "vlw_token")
const robot_wxid = bucketGet("wx", "robot_wxid")
const xyos = new xyo(xyo_host, xyo_token, robot_wxid);
if (!(xyos.success)) throw new Error(`【${pluginName}】西瓜框架连接失败`)

// xyos.SendGroupMsgAndAt("48038273977@chatroom","test","Liksbe")
// xyos.SendImageMsg("48038273977@chatroom","https://daoadmin.kuryun.com/static/imgs//home/logo.png")
// xyos.SendCardMsg("48038273977@chatroom","Liksbe")

// const title = "test title";const xml = `<msg><appmsg appid="" sdkver=""><title>${title}</title><des>Jusbe:pyqJusbe:pyq</des><action>view</action><type>19</type><showtype>0</showtype><content /><url /><dataurl /><lowurl /><lowdataurl /><recorditem>&lt;recordinfo&gt;&lt;title&gt;${title}&lt;/title&gt;&lt;desc&gt;Jusbe:pyqJusbe:pyq&lt;/desc&gt;&lt;datalist count="2"&gt;&lt;dataitem dataid="451a1478fb4729f3d2268e97838a051f" datatype="1" datasourceid="7633035549532630191"&gt;&lt;cdnencryver&gt;1&lt;/cdnencryver&gt;&lt;datadesc&gt;pyq&lt;/datadesc&gt;&lt;sourcedatapath /&gt;&lt;sourcethumbpath /&gt;&lt;msgDataPath /&gt;&lt;msgThumpPath /&gt;&lt;sourcename&gt;Jusbe&lt;/sourcename&gt;&lt;sourcetime&gt;2024-01-23 21:03:32&lt;/sourcetime&gt;&lt;sourceheadurl&gt;https://wx.qlogo.cn/mmhead/ver_1/CEZSvbPp8Shm5qmzNVvgbLDxEv51ete39EsBvlIicPSmiaFTom5joicwnTlKMEpfXcXcfvZsn6x3K9tySx0WIJw2w/132&lt;/sourceheadurl&gt;&lt;fromnewmsgid&gt;7633035549532630191&lt;/fromnewmsgid&gt;&lt;dataitemsource&gt;&lt;msgid&gt;7633035549532630191&lt;/msgid&gt;&lt;createtime&gt;1706015012&lt;/createtime&gt;&lt;hashusername&gt;b1585636b469dda09542576a31c92368bb8f274dbef2529ad061756a4219d911&lt;/hashusername&gt;&lt;/dataitemsource&gt;&lt;/dataitem&gt;&lt;dataitem dataid="8c5d10ccb83aac8efce3adb713f703a6" datatype="1" datasourceid="4286550637675007323"&gt;&lt;cdnencryver&gt;1&lt;/cdnencryver&gt;&lt;datadesc&gt;pyq&lt;/datadesc&gt;&lt;sourcedatapath /&gt;&lt;sourcethumbpath /&gt;&lt;msgDataPath /&gt;&lt;msgThumpPath /&gt;&lt;sourcename&gt;Jusbe&lt;/sourcename&gt;&lt;sourcetime&gt;2024-01-23 21:06:27&lt;/sourcetime&gt;&lt;sourceheadurl&gt;https://wx.qlogo.cn/mmhead/ver_1/CEZSvbPp8Shm5qmzNVvgbLDxEv51ete39EsBvlIicPSmiaFTom5joicwnTlKMEpfXcXcfvZsn6x3K9tySx0WIJw2w/132&lt;/sourceheadurl&gt;&lt;fromnewmsgid&gt;4286550637675007323&lt;/fromnewmsgid&gt;&lt;dataitemsource&gt;&lt;msgid&gt;4286550637675007323&lt;/msgid&gt;&lt;createtime&gt;1706015187&lt;/createtime&gt;&lt;hashusername&gt;b1585636b469dda09542576a31c92368bb8f274dbef2529ad061756a4219d911&lt;/hashusername&gt;&lt;/dataitemsource&gt;&lt;/dataitem&gt;&lt;/datalist&gt;&lt;favusername&gt;&lt;/favusername&gt;&lt;favcreatetime&gt;0&lt;/favcreatetime&gt;&lt;/recordinfo&gt;</recorditem><thumburl /><messageaction /><laninfo /><extinfo /><sourceusername /><sourcedisplayname /><commenturl /><appattach><totallen>0</totallen><attachid /><emoticonmd5 /><fileext /><aeskey /></appattach><webviewshared><publisherId /><publisherReqId>0</publisherReqId></webviewshared><weappinfo><pagepath /><username /><appid /><appservicetype>0</appservicetype></weappinfo><websearch /></appmsg><fromusername>Liksbe</fromusername><scene>0</scene><appinfo><version>1</version><appname></appname></appinfo><commenturl></commenturl></msg>`
// xyos.SendMessageRecord("48038273977@chatroom",xml)

// xyos.SendShareLinkMsg("48038273977@chatroom","test title","test desc","https://daoadmin.kuryun.com/static/imgs//home/logo.png","https://www.doubao.com/chat/")

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
