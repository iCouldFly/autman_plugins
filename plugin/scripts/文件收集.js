//[title: 文件收集]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable: false] 禁用开关，true表示禁用，false表示可用
//[admin: false] 是否为管理员指令
//[rule: raw \[CQ\:\s?image\,.*file\=.+\]] 匹配规则，多个规则时向下依次写多个
//[rule: cqtest] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: false]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.0]版本号
//[public: false] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 999] 上架价格
//[description: 关于插件的描述] 使用方法尽量写具体
//[imType+:tg,tb] 白名单,只在qq,wx生效
//[groupId+:1159241609,1774635289,1604423588,1241814235,1333455571,1855542885,1821801321,1166727452,1157979657,1088679595,1109579085,1184397178,1423742333] 
//先将机器人拉进群/频道，并在上面（groupId+）填入群号
//目前只识别CQ码中的链接
//文件下载路径：/collected/${group_name}/${filename}

// Channel_Bot：136817688

// [tg]我的群组：-1001754696433
// [tg]小爱同学：1159241609
// [tg]深圳外围：1774635289
// [tg]朱颜别镜 | 妹子图 | 美女图：1604423588
// [tg]少女实在是太美好了：1241814235
// [tg]幻想高质量美图［NSFW］：1333455571
// [tg]美女收集器👗：1855542885
// [tg]硬盘仓库[NSFW]：1821801321
// [tg]足控天堂：1166727452
// [tg]美女🍑写真：1157979657
// [tg]白丝即正义：1088679595
// [tg]快乐星球 | 妹子图 | 收集器：1109579085
// [tg]今天又发现了哪个漂亮小姐姐：1184397178
// [tg]FinelyGirlsChannel：1423742333

const middleware = require('./middleware.js');
const request = require('request');
const fs = require('fs');
const path = require('path');

const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID)

!(async () => {
    // const is_admin = await s.isAdmin()
    const plugin_name = await s.getPluginName()
    // const plugin_version = await s.getPluginVersion()
    // const user_avatar_url = await s.getUserAvatarUrl()
    const im = await s.getImtype()
    const user_id = await s.getUserID()
    const user_name = await s.getUserName()
    const group_name = await s.getGroupName()
    const group_id = await s.getChatID()
    // const param1 = await s.param(1)
    // const param2 = await s.param(2)
    // const param3 = await s.param(3)
    const message = await s.getMessage()
    const message_id = await s.getMessageID()

    const cq_imgs = /(?<=\[CQ:image,\s?file=).+\.\w+(?=\])/img.exec(message)
    // s.reply(`收到：${cq_imgs.length}个图片`)
    // s.reply(JSON.stringify(cq_imgs))
    setTimeout(() => {

        cq_imgs.forEach(v => {
            const url = v; // 替换为你的文件URL  
            const filename = /[^\/]+\.\w+$/ig.exec(v)[0]
            const dest = path.join(__dirname, `/collected/${group_name}/${filename}`); // 指定下载文件的路径  

            // s.reply(`开始下载文件：${url}`)
            // s.reply(`开始下载文件：${dest.toString()}`)
            // 检查并创建目录  
            const directoryPath = path.dirname(dest);
            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath, { recursive: true });
            }

            downloadImageWithProxy(url, dest);
        })

    }, 3000);

    const msggggg = `[${im}]${group_name}：
群号：${group_id}
ID：${message_id}
发送人：${user_name}（${user_id}）
新增图片：${cq_imgs.length} 个
${cq_imgs.toString()}`
})()

const downloadImageWithProxy = (url, dest, proxy = null) => {
    const options = {
        url: url,
        encoding: null // 设置为null，以接收二进制数据  
    };
    if (proxy) options.proxy = proxy // 设置代理  

    request(options, (error, response, body) => {
        if (error) {
            console.error('请求失败:', error);
            return;
        }
        if (response.statusCode !== 200) {
            console.error('响应状态码不是 200:', response.statusCode);
            return;
        }

        const filePath = path.join(__dirname, dest);
        const file = fs.createWriteStream(filePath);

        file.write(body);
        file.end();

        console.log(`图片已保存到 ${filePath}`);
    });
};
