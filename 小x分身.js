//[author: jusbe]
//[title: 小x分身]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable: false] 禁用开关，true表示禁用，false表示可用
//[admin: true] 是否为管理员指令
//[rule: raw ^小(x|X)分身$] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: true]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.1]版本号
//[public: true] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: 小x分身签到，自行设置 插件定时 或 定时推送<br>首发: 240608<br><img src="https://bbs.autman.cn/assets/files/2024-07-01/1719835587-243361-x.jpg" alt="小x分身" />] 使用方法尽量写具体
//[param: {"required":true,"key":"otto.91ichare","bool":false,"placeholder":"i=abc&d=device&v=version&vi=123&c=7","name":"token","desc":"timestamp 不要放进来"}]

const axios = require('axios');

const middleware = require('./middleware.js')
const senderID = middleware.getSenderID()
const s = new middleware.Sender(senderID)

!(async () => {
    const plugin_name = await s.getPluginName()
    const plugin_version = await s.getPluginVersion()

    let message = `${plugin_name} v${plugin_version}\n========================`

    const token = await middleware.bucketGet("otto", "91ichare")
    if (!token) return s.reply(message + "\n请在配参设置 token")

    axios.request({
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://chaos.91ishare.cn/ServerV110?fn=qd',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': '83',
            'Host': 'chaos.91ishare.cn',
            'Connection': 'Keep-Alive',
            'Accept-Encoding': 'gzip',
            'User-Agent': 'okhttp/3.9.1'
        },
        data: `${token}&timestamp=${Date.now()}`,
        // data: qs.stringify({
        //     'i': '5e214f4afeffa9c7',
        //     'd': 'MI 9 SE/Xiaomi',
        //     'v': '30.6',
        //     'vi': '308',
        //     'c': '7',
        //     'timestamp': '1718448525030'
        // })
    })
        .then(({ data }) => {
            console.log(data)
            //  {"status":0,"zd":1}
            if (data.status) return s.reply(message + `\n🎁 [${data.status}]${data.err || "幸运值+" + data.lv}`)
            if (data.zd) return s.reply(message + `\n🎉 [${data.status}]获得 ${data.zd} 天会员`)
            return s.reply(JSON.stringify(data))
        })
        .catch(({ response: { status, statusText } } = error) => s.reply(message + `\n[${status}]${statusText}}`));
})()
