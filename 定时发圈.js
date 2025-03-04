// [title: 定时发圈]
// [class: 工具类]
// [cron: 6 6 6,16,26 * *]
// [platform: qq,wx,tb,tg,web,wxmp]
// [bypass: false]
// [priority: 1]
// [admin: true]
// [disable:true]

async function main(){
    const reply_rules = "^(话费|充话费|慢充)$" // 定时发圈，在知识库中查找的 rules

    const middleware = await require('./middleware.js');
    const request = require('util').promisify(require('request'));

    const vlw_addr = await middleware.bucketGet("wx","vlw_addr")
    const vlw_token = await middleware.bucketGet("wx","vlw_token")
    const robot_wxid = await middleware.bucketGet("wx","robot_wxid")

    const reply_data = await middleware.bucketAllKeys("reply")
    let reply_content = ""
    for (const item of reply_data) {
        const obj = await middleware.bucketGet("reply", item);
        if (obj.rules == reply_rules) {
            reply_content = obj.content;
            break; // 停止循环，因为已经找到了匹配的内容
        }
    }

    console.debug(`发圈内容：\\r\\n${reply_content}`)
    const result = await SendMoments_Str(reply_content)
    // console.debug(`vlw_addr：${vlw_addr}`)
    // console.debug(`vlw_token：${vlw_token}`)
    // console.debug(`robot_wxid：${robot_wxid}`)
    // console.debug(`发圈结果：${result.Result}`)
    notify_str = "======== 定时发圈 ========\\r\\n"
    notify_str += `发圈结果：${result.Result}\\r\\n`
    notify_str += `发圈内容：\\r\\n${reply_content}`
    middleware.notifyMasters(notify_str,"qq,wx,tb")
    
    //wx发文本朋友圈
    async function SendMoments_Str (content){
        return (
            await requestXyo({
                api: "SendMoments_Str",
                content: content
            })
        )
    }

    /*↓↓↓↓↓↓↓↓↓↓↓↓ 此段代码来自 bncr/BncrData/Adapter/wxXyo.js ↓↓↓↓↓↓↓↓↓↓↓↓*/
    async function requestXyo(body) {
        return (
            await request({
                url: vlw_addr,
                method: 'post',
                body: {
                    ...body, ...{
                        token:vlw_token, robot_wxid: robot_wxid
                    }
                },
                json: true
            })
        ).body;
    }
}

main()