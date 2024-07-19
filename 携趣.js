//[title: 携趣]
//[class: 工具类]
//[version: 0.0.1]
//[admin: true]
//[rule: ^携趣$]
//[cron: 55 */4 * * *]
//[public: true]
//[disable: false]
//[price: 0.01]
//[priority: 1]
//[platform: all]
//[service: Jusbe]
//[description: 命令：携趣（可自定义）</br>功能：定时更新白名单</br>因携趣同一IP仅可登记为一个携趣账号白名单</br></br>首发：20240124]
// [param: {"required":false,"key":"xiequ.uid","bool":false,"placeholder":"如：123456","name":"uid","desc":""}]
// [param: {"required":false,"key":"xiequ.ukey","bool":false,"placeholder":"如：7A78F38EA ...","name":"ukey","desc":""}]
// [param: {"required":false,"key":"xiequ.push","bool":false,"placeholder":"如：qqindiv:123,qqgroup:456,wxgroup:789,tbgroup:111,qbgroup:333","name":"额外通知","desc":"默认通知管理员</br></br>在此获取你的账号信息：\nhttps://www.xiequ.cn/redirect.aspx?act=MyIpWhiteList.aspx"}]

const pluginName = getTitle()
// const userid = GetUserID()
// const imType = GetImType();
// const param1 = param(1);
// const param2 = param(2);
// const content = GetContent()

Debug(`<div style="text-align: center; font-size: 72px; font-weight: bold;">${pluginName}</div>`)

try {
    importJs('jusapi.js')
    const jv = jusapi.test_version("0.1.2")
    if (!jv.success) throw new Error(`【${pluginName}】插件 jusapi 需更新至：${jv.data}+\n .`)
} catch (e) {
    throw new Error(`【${pluginName}】请在插件市场安装“jusapi”\n .`);
}

function main(){
    const pusher = jusapi.pusher(bucketGet("xiequ", "push"))

    const uid = bucketGet("xiequ", "uid");if(!uid) return notifyMasters(`【${pluginName}】请在插件配参中设置uid`)
    const ukey = bucketGet("xiequ", "ukey");if(!ukey) return notifyMasters(`【${pluginName}】请在插件配参中设置uid`)
    const ip = xiequ.auto_check_ip()[0];if(!/(\d{2,3}\.){3}\d{2,3}/.test(ip)) return notifyMasters(pusher.push(`【${pluginName}】获取IPv4失败，当前地址：${ip}`))

    const xq = new xiequ(uid,ukey)
    const ip_suitdt = xq.ip_suitdt().data;if(ip_suitdt.length) notifyMasters(pusher.push(`【${pluginName}】${JSON.stringify(ip_suitdt[0])}`))
    const ip_list = xq.ip_list();if(ip_list.includes(ip)) return notifyMasters(pusher.push(`【${pluginName}】${ip} 白名单已存在`))
    const ip_del = xq.ip_del();notifyMasters(pusher.push(`【${pluginName}】清空白名单：${ip_del}`))
    const ip_add = xq.ip_add(ip);notifyMasters(pusher.push(`【${pluginName}】${ip} 添加白名单：${ip_add}`))
}

class xiequ{
    constructor (uid,ukey){
        const headers = {
            "Content-Type": "text/plain; charset=utf-8",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cache-Control": "no-cache",
            "Host": "op.xiequ.cn",
            "Pragma": "no-cache",
            "Proxy-Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.139 Safari/537.36"
        }

        /** 获取白名单
         * @returns {string} 白名单列表，“,”分隔
         */
        this.ip_list = function (){
            const url = `http://www.xiequ.cn/IpWhiteList.aspx?uid=${uid}&ukey=${ukey}&act=get`
            rebug(`ip_list_url：${url}`)
            return request({
                url:url,
                method:"get",
                dataType:"text"
            },function(error,response,headers,body){
                rebug(`ip_list：${JSON.stringify(body)}`)
                return body
            })
        }
    
        /** 添加白名单
         * @param {string} ip 
         * @returns {string} 
         */
        this.ip_add = function (ip){
            const url = `http://www.xiequ.cn/IpWhiteList.aspx?uid=${uid}&ukey=${ukey}&act=add&ip=${ip}`
            rebug(`ip_add_url：${url}`)
            return request({
                url:url,
                method:"get",
                dataType:"text"
            },function(error,response,headers,body){
                rebug(`ip_add：${JSON.stringify(body)}`)
                return body
            })
        }
    
        /** 删除白名单
         * @param {string} ip 要删除的ip，all为删除所有ip
         * @returns {string} 
         */
        this.ip_del = function (ip="all"){
            const url = `http://www.xiequ.cn/IpWhiteList.aspx?uid=${uid}&ukey=${ukey}&act=del&ip=${ip}`
            rebug(`ip_del_url：${url}`)
            return request({
                url:url,
                method:"get",
                dataType:"text"
            },function(error,response,headers,body){
                rebug(`ip_del：${JSON.stringify(body)}`)
                return body
            })
        }
    
        /** 已购产品信息
         * @returns {json} 
         */
        this.ip_suitdt = function (){
            const url = `http://www.xiequ.cn/ApiUser.aspx?act=suitdt&uid=${uid}&ukey=${ukey}`
            // const url = "http://op.xiequ.cn/ApiUser.aspx?act=suitdt&uid=112847&ukey=C56623D153D40598D84BB35346C41240"
            rebug(`ip_suitdt_url：${url}`)
            return request({
                "url":url,
                "method":"GET",
                "headers": headers,
                "dataType":"json"
            },function(error,response,headers,body){
                rebug(`ip_suitdt_response：${JSON.stringify(response)}`)
                return body
            })
        }
    }

    static auto_check_ip = function(){
        return new Array(
            request({url:"http://121.199.42.16/VAD/OnlyIp.aspx?yyy=123",method:"get"}),
            request({url:"http://api.xiequ.cn/VAD/OnlyIp.aspx?yyy=123",method:"get"}),
            request({url:"http://www.xiequ.cn/OnlyIp.aspx?yyy=123",method:"get"})
        ).filter(Boolean)
    }
}

main()
Debug('================ End ================')
