//[title: 群信息]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[author: jusbe] 售后联系方式
//[disable: false] 禁用开关，true表示禁用，false表示可用
//[admin: false] 是否为管理员指令
//[rule: ^群信息$] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: false]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.0]版本号
//[public: true] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: 获取当前社交平台类型、群号、用户名、用户ID<br>首发：20231115<br><img src="https://bbs.autman.cn/assets/files/2024-06-24/1719217016-591578-63acac87-6676-4711-b49c-b1557aded8a9.jpg" alt="cpolar" />] 使用方法尽量写具体

!(async () => {
    const middleware = require('./middleware.js');
    const senderID = middleware.getSenderID();
    const s = new middleware.Sender(senderID)
    const user_avatar_url = await s.getUserAvatarUrl()
    const im = await s.getImtype()
    const user_id = await s.getUserID()
    const user_name = await s.getUserName()
    const group_name = await s.getGroupName()
    const group_id = await s.getChatID()

    let msg = ''
    if(user_avatar_url) msg += `[CQ:image,file=${user_avatar_url}]\n`
    msg += `平台：${im}\n`
    msg += `用户：${user_name}\n`
    msg += `I    D：${user_id}\n`
    msg += `群组：${group_name}\n`
    msg += `群号：${group_id}`

    s.reply(msg)
})()
