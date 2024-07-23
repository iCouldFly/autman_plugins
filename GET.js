// [title: GET]
// [class: 工具类]
// [version: 0.0.1]
// [price: 2]
// [rule: ^[Gg][Aa][Tt]\s([\s\S]+)$]
// [bypass: true]
// [priority: 1]
// [public: true]
// [admin: true]
// [disable:false]
// [platform: all]
// [service: Jusbe]
// [description: 请求些api，比如51白名单、品易白名单]

const param1 = param(1)
// const content = GetContent()

function main() {
    let url = param1.replace(/(?<=^\S+)[\r\n\s]+\S+$/mg, '')
    url = url.replace("%ip%", get_ip())
    Debug(url)
    // sendText(`url: ${url}`)
    sendText(
        request({
            url: url,
            method: 'get',
            dataType: 'text'
        })
    )
}

function get_ip() {
    let ip = request({ url: `http://4.ipw.cn`, method: 'get' }) // ipw
    if (!ip) ip = request({ url: `http://121.199.42.16/VAD/OnlyIp.aspx?yyy=123`, method: 'get' }) // 携趣1
    if (!ip) ip = request({ url: `http://api.xiequ.cn/VAD/OnlyIp.aspx?yyy=123`, method: 'get' }) // 携趣2
    if (!ip) ip = request({ url: `http://www.xiequ.cn/OnlyIp.aspx?yyy=123`, method: 'get' }) // 携趣3
    return ip
}

main()
