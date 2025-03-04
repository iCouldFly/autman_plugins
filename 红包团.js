//[title: 红包团]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable: false] 禁用开关，true表示禁用，false表示可用
//[admin: true] 是否为管理员指令
//[rule: raw sfc_\d{14}\w{5}] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: false]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.1]版本号
//[public: false] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 999] 上架价格
//[description: 关于插件的描述] 使用方法尽量写具体
//[param: {"required":false,"key":"otto.wechat_openGroup_key","bool":false,"placeholder":"jd_wechat_openGroup_id","name":"变量名","desc":""}]

const middleware = require('./middleware.js')

const senderID = middleware.getSenderID()
const s = new middleware.Sender(senderID)

!(async () => {
    const message = await s.getMessage()
    const GroupName = await s.getGroupName()
    const UserName = await s.getUserName()
    const wechat_openGroup_key = (await middleware.bucketGet("otto", "wechat_openGroup_key")) || "jd_wechat_openGroup_id"
    const ids = message.match(/sfc_\d{14}\w{5}/img)

    middleware.notifyMasters(`收到【${GroupName || UserName}】发出的红包团 ${wechat_openGroup_key}(${ids.length}条)：\n${ids.join("\n")}`)
    ids.forEach(element => {
        s.breakIn(`export ${wechat_openGroup_key}="${element}"`)
    });
})()