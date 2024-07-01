// [title: 顺风车]
// [class: 工具类]
// [version: 0.0.1]
// [price: 999]
// [rule: ^(登录)\s+(\S+)\s*(\S+)*$]
// [bypass: false]
// [priority: 1]
// [public: false]
// [admin: false]
// [disable:true]
// [platform: all]
// [service: Jusbe]
// [description: leaf 退圈，插件失效<br>首发：20240327]

// [param: {"required":false,"key":"qltxt.items","bool":false,"placeholder":"json ...","name":"项目清单","qlid":"青龙ID","desc":"json格式，key：关键词，type：txt|json，path：文件路径，value：变量匹配规则reg"}]
// [param: {"required":false,"key":"qltxt.notify","bool":false,"placeholder":"qqgroup:123,wxindiv:456","name":"任务通知","desc":""}]

const onecc_host = "http://2w.onecc.cc"

const pluginName = getTitle()
const isadmin = isAdmin()
const userid = GetUserID()
// const chatid = GetChatID()
const imType = GetImType();
const param1 = param(1);
const param2 = param(2);
const param3 = param(3);
// const param4 = param(4);
// const content = GetContent()
Debug(`<div style="text-align: center; font-size: 72px; font-weight: bold;">${pluginName}</div>`)
sendText("如果没反应请过段时间再试")

try {
    importJs('jusapi.js')
} catch (e) {
    throw new Error(`【${pluginName}】请在插件市场安装“jusapi”\n .`);
}
const jv = jusapi.test_version("0.1.3")
if (!jv.success) throw new Error(`【jusapi】插件需更新至：${jv.data}+\n .`)

try {
    importJs('青龙txt提交.js')
} catch (e) {
    throw new Error(`【${pluginName}】请在插件市场安装“青龙txt提交”\n .`);
}

const try_max = 3 // 用户重试次数
const cfg = [
    {
        id: 1,
        key: "雷达",
        title: "雷达汽车APP",
        type: "password",
        fuc: GeegaPD,
        breakIn: `雷达=%ck%`,
        disable: true
    }, {
        //     id: 2,
        //     key: "传祺",
        //     title: "广汽传祺APP",
        //     type: "qr",
        //     fuc: gqcq,
        //     breakIn: `提交 传祺 %ck%`,
        //     disable: true
        // }, {
        id: 3,
        key: "阿里云盘",
        title: "阿里云盘",
        type: "qr",
        fuc: ali,
        breakIn: `阿里云盘=%ck%`,
        disable: false
    }, {
        id: 4,
        key: "顺丰",
        title: "顺丰速运",
        type: "qr",
        fuc: sfsy,
        breakIn: `顺丰速运=%ck%`,
        disable: false
    }, {
        id: 5,
        key: "得物",
        title: "顺丰速运",
        type: "sms",
        fuc: dewu,
        breakIn: `得物=%dewuCK%`,
        disable: false
    }, {
        id: 6,
        key: "传祺",
        title: "leaf传祺",
        type: "qr",
        fuc: gqcq,
        breakIn: `提交 leaf传祺 %ck%`,
        disable: false
    }]

function main() {
    const item = cfg.filter(v => { return v.key == param2 })[0]
    if (!item) return sendErr(`未找到项目“${param2}”`)
    if (item.disable) return sendErr(`${param2} 项目已禁用`)

    // upCookie(item.key,item["fuc"]())
    // breakIn(`提交 ${item.key} ${item["fuc"]()}`)

    const login = item["fuc"](); if (login.success == false) return sendErr(login.msg)
    if (item.breakIn) {
        let bi = item.breakIn
        const _i = /(?<=%)[^%]+(?=%)/igm.exec(bi)
        // sendText(`bi: ${bi}`); sendText(`_i: ${_i}`); sendText(`login.data[${_i}]:${login.data[_i]}`)
        _i.forEach(v => {
            // sendText(`v: %${v}%`);sendText(`login.data[${v}]: ${login.data[v]}`)
            bi = bi.replace(`%${v}%`, login.data[v])
        })
        Debug(`breakIn: ${bi}`)
        breakIn(bi)
    }
}

function dewu() {
    const phone = inputReg("请输入你的手机号：", /^1\d{10}$/); if (!phone) return rebug("输入有误")

    // let try_time = 0
    let sms_data, code_data

    let o = {
        url: "/api/main/sms",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            t: He(),
            n: Qe(10)
        },
        body: {
            "app": "DeWuH5Mobile",
            "phone": phone,
            "data": null,
            "captcha": null
        }
    }
    o.headers.s = Xe(o)
    o.url = onecc_host + o.url
    o.headers = {
        ...{
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.139 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
            // 'n': '7dvzn2arbz',
            // 's': '4ef53a313388428a3304e3ea1eb70ca1',
            // 't': '1714316211871',
            'Origin': 'http://2w.onecc.cc',
            'Referer': 'http://2w.onecc.cc/',
            'Accept-Language': 'zh-CN,zh;q=0.9'
        }, ...o.headers
    }
    o.dataType = "json"
    sms_data = request(o); if (!sms_data.status) return rebug("获取验证码失败")

    const code = inputReg("请输入你的验证码："); if (!code) return rebug("")
    let a = {
        url: "/api/main/login",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            t: He(),
            n: Qe(10)
        },
        body: {
            "app": "DeWuH5Mobile",
            "phone": phone,
            "code": code,
            "data": null,
            "captcha": null
        }
    }
    a.headers.s = Xe(a)
    a.url = onecc_host + a.url
    a.headers = {
        ...{
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.139 Mobile Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            // 'n': 'fu7cwnho8c',
            // 's': 'dfb706535a4351130887133ff9aa764c',
            // 't': '1714320370246',
            'Origin': 'http://2w.onecc.cc',
            'Referer': 'http://2w.onecc.cc/',
            'Accept-Language': 'zh-CN,zh;q=0.9'
        }, ...a.headers
    }
    a.dataType = "json"
    code_data = request(a);
    if (!code_data.status) return rebug("获取验证码失败")
    sendText(code_data.message)

    return rebug(
        code_data.message,
        code_data.status,
        {
            dewuCK: code_data.data.value
        })
}
// do {
// sms_data = z(a)
// rebug(`qr_data: ${JSON.stringify(qr_data)}`)
// try_time++
// } while (qr_data.code && try_time < try_max)

// if (try_time > try_max) return rebug("失败次数过多，请稍后重试")
// if (qr_data.code) return rebug(qr_data.msg)

// return rebug(
//     login_data,
//     true,
//     {
//         ck: `AT:${login_data.data.token},RT:${login_data.data.refreshToken}`
//     })
// }

function GeegaPD() {
    sendText("hello world")
}

function gqcq() {
    let try_time = 0
    let qr_data
    do {
        qr_data = request({
            url: "https://service.leafxxx.win/gqcq/get_qr_code",
            // useproxy: true,
            // proxyAddr: request({ url: get_proxy(), method: "get" }),
            "headers": {
                "accept": "*/*",
                "accept-language": "zh-CN,zh;q=0.9",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": "\"Android\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest"
            },
            "referrer": "https://service.leafxxx.win/gqcq/login.html",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "omit",
            dataType: "json"
        })
        rebug(`qr_data: ${JSON.stringify(qr_data)}`)
        try_time++
    } while (qr_data.code && try_time < try_max)

    if (try_time > try_max) return rebug("失败次数过多，请稍后重试")
    if (qr_data.code) return rebug(qr_data.msg)

    try_time = 0
    let s1
    let login_data = 1
    do {
        s1 = inputReg(`${login_data ? "" : "登录失败！\n"}请使用【微信摄像头扫码】授权登录，登录成功后回复：y${image(`https://open.weixin.qq.com/connect/qrcode/${qr_data.data}`)}`, /^[yq]$/i)
        if (s1) {
            login_data = request({
                url: "https://service.leafxxx.win/gqcq/qr_scan",
                // useproxy: true,
                // proxyAddr: request({ url: get_proxy(), method: "get" }),
                "headers": {
                    "accept": "*/*",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\"",
                    "sec-ch-ua-mobile": "?1",
                    "sec-ch-ua-platform": "\"Android\"",
                    "x-requested-with": "XMLHttpRequest",
                    "Referer": "https://service.leafxxx.win/gqcq/login.html",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": `uuid=${qr_data.data}`,
                "method": "POST",
                dataType: "json"
            });
        } else {
            return rebug(`用户取消操作`)
        }
        rebug(`login_data: ${JSON.stringify(login_data)}`)
        try_time++
    } while (s1 && try_time < try_max && !login_data)

    if (try_time > try_max) return rebug("失败次数过多，请稍后重试")
    if (!login_data) return rebug("登录验证失败")

    return rebug(
        login_data,
        true,
        {
            // ck: `AT:${login_data.data.token},RT:${login_data.data.refreshToken}` // 路飞
            ck: login_data.data.refreshToken // leaf
        })
}

function ali() {
    Debug("登录 阿里云盘")
    let try_time = 0
    let qr_data
    do {
        qr_data = request({
            url: "https://api.nn.ci/alist/ali/qr",
            // useproxy: true,
            // proxyAddr: request({ url: get_proxy(), method: "get" }),
            "headers": {
                "accept": "*/*",
                "accept-language": "zh-CN,zh;q=0.9",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://alist.nn.ci/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET",
            dataType: "json"
        })
        rebug(qr_data)
        try_time++
    } while (qr_data.hasError && try_time < try_max)

    if (try_time > try_max) return rebug("失败次数过多，请稍后重试")
    if (qr_data.hasError) return rebug(`获取二维码失败：hasError==true`)
    if (!qr_data.content.success) return rebug(`获取二维码失败：content.success==false`)

    const qr_url = encodeQR(qr_data.content.data.codeContent, 400)
    try_time = 0
    let s1
    let login_data
    let login_success

    do {
        s1 = inputReg(`${!login_success ? "" : login_success + '！\n'}请使用阿里云盘APP授权登录，登录成功后回复：y${image(qr_url)}`, /^[yq]$/i)
        if (s1) {
            login_data = request({
                url: "https://api.nn.ci/alist/ali/ck",
                "headers": {
                    "accept": "*/*",
                    "accept-language": "zh-CN,zh;q=0.9",
                    "content-type": "application/json",
                    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site"
                },
                "referrer": "https://alist.nn.ci/",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": {
                    "ck": qr_data.content.data.ck,
                    "t": qr_data.content.data.t.toString(),
                    // "t": Date.now().toString()
                },
                "method": "POST",
                "mode": "cors",
                "credentials": "omit",
                dataType: "json"
            })
        } else {
            return rebug(`用户取消操作`)
        }
        rebug(login_data)
        login_success = login_data.content.data.qrCodeStatus
        try_time++
        // Debug(`[${typeof qr_data.content.data.ck}]ck: ${qr_data.content.data.ck}`)
        Debug(`Date.now: ${Date.now()}`)
    } while (s1 && try_time < try_max && login_success != "CONFIRMED")

    if (try_time > try_max) return rebug("失败次数过多，请稍后重试")
    if (login_data.hasError) return rebug(`登录失败：hasError==true`)
    if (!login_data.content.success) return rebug(`登录失败：content.success==false`)
    if (login_data.content.data.qrCodeStatus != "CONFIRMED") return rebug(`登录失败：${login_data.content.data.qrCodeStatus}`)

    try {
        importJs('base64.js')
    } catch (e) {
        throw new Error(`【${pluginName}】请在插件市场安装“base64”\n .`);
    }

    let user_data = JSON.parse(atob(login_data.content.data.bizExt))
    sendText(`${image(user_data.pds_login_result.avatar)}
======= 阿里云盘 =======
I  D：${user_data.pds_login_result.userId}
用户：${user_data.pds_login_result.nickName}
账号：${user_data.pds_login_result.userName}`)

    return rebug(
        login_data.content.data.qrCodeStatus,
        true,
        {
            ck: user_data.pds_login_result.refreshToken
        })
}

function sfsy() {
    // sendText("正在启动顺丰登录程序")
    let try_time = 0
    let qr_data
    do {
        qr_data = request({
            url: "https://service.leafxxx.win/sfsy/get_qr_code",
            // useproxy: true,
            // proxyAddr: request({ url: get_proxy(), method: "get" }),
            "headers": {
                "accept": "*/*",
                "accept-language": "zh-CN,zh;q=0.9",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\"",
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": "\"Android\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest"
            },
            "referrer": "https://service.leafxxx.win/sfsy/login.html",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "omit",
            dataType: "json"
        })
        rebug(`qr_data: ${JSON.stringify(qr_data)}`)
        try_time++
    } while (qr_data.code && try_time < try_max)
    // qr_data: {"code":1,"data":null,"msg":"没有获取到二维码, 请重试"}

    if (try_time > try_max) return rebug("失败次数过多，请稍后重试")
    if (qr_data.code) return rebug(qr_data.msg)

    try_time = 0
    let s1
    let login_data = 1
    do {
        s1 = inputReg(`${login_data ? "" : "登录失败！\n"}请使用【微信摄像头扫码】授权登录，登录成功后回复：y${image(`https://open.weixin.qq.com/connect/qrcode/${qr_data.data}`)}`, /^[yq]$/i)
        if (s1) {
            // sendText(`uuid=${qr_data.data}`)
            login_data = request({
                // useproxy: true,
                // proxyAddr: request({ url: get_proxy(), method: "get" }),
                'method': 'POST',
                'url': 'https://service.leafxxx.win/sfsy/qr_scan',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                formData: {
                    'uuid': qr_data.data
                },
                dataType: "json",
                // timeOut: 10000
            });
        } else {
            return rebug(`用户取消操作`)
        }
        rebug(`login_data: ${JSON.stringify(login_data)}`)
        try_time++
    } while (s1 && try_time < try_max && !login_data)

    if (try_time > try_max) return rebug("失败次数过多，请稍后重试")
    if (!login_data) return rebug("登录验证失败")
    if (login_data.code) return rebug(login_data.msg)

    sendText(`======= 顺丰速运 =======
用户：${login_data.data.mobile.replace(/(?<=^\d{3})\d{4}/, "****")}`)

    return rebug(
        login_data.msg,
        true,
        {
            ck: login_data.data.url
        })
}

main()

// 路飞 http://2w.onecc.cc/#/
function z(a) {
    let o = He(),
        n = Qe(10);
    return a.headers.t = o, a.headers.n = n, a.headers.s = Xe(a), a.url = `${onecc_host}${a.url}`, request(
        a
        , function (e, r, d) {
            Debug(`e: ${e}`)
            Debug(`e: ${r}`)
            Debug(`e: ${d}`)
        })
}

function Qe(a) {
    for (var o = "", n = "0123456789abcdefghijklmnopqrstuvwxyz", f = 0; f < a; f++) o += n.charAt(Math.floor(Math.random() * n.length));
    return o
}

function He() {
    return new Date().getTime()
}

function Xe(a) {
    const {
        url: o,
        method: n,
        data: f
    } = a;
    let m = "a1752adfba6ebf0f0423654973ecee84",
        e = a.headers.t,
        O = a.headers.n,
        h = o,
        b = n,
        S = JSON.stringify(f),
        C = b + h + S + e + O + m;
    return Ze(C)
}

function Ze(a) {
    a = a.toString();

    function o(y, v) {
        return y << v | y >>> 32 - v
    }

    function n(y, v) {
        var k, U, P, q, $;
        return P = 2147483648 & y, q = 2147483648 & v, k = 1073741824 & y, U = 1073741824 & v, $ = (1073741823 & y) + (1073741823 & v), k & U ? 2147483648 ^ $ ^ P ^ q : k | U ? 1073741824 & $ ? 3221225472 ^ $ ^ P ^ q : 1073741824 ^ $ ^ P ^ q : $ ^ P ^ q
    }

    function f(y, v, k) {
        return y & v | ~y & k
    }

    function m(y, v, k) {
        return y & k | v & ~k
    }

    function e(y, v, k) {
        return y ^ v ^ k
    }

    function O(y, v, k) {
        return v ^ (y | ~k)
    }

    function h(y, v, k, U, P, q, $) {
        return y = n(y, n(n(f(v, k, U), P), $)), n(o(y, q), v)
    }

    function b(y, v, k, U, P, q, $) {
        return y = n(y, n(n(m(v, k, U), P), $)), n(o(y, q), v)
    }

    function S(y, v, k, U, P, q, $) {
        return y = n(y, n(n(e(v, k, U), P), $)), n(o(y, q), v)
    }

    function C(y, v, k, U, P, q, $) {
        return y = n(y, n(n(O(v, k, U), P), $)), n(o(y, q), v)
    }

    function A(y) {
        for (var v, k = y.length, U = k + 8, P = (U - U % 64) / 64, q = 16 * (P + 1), $ = new Array(q - 1), fe = 0, se = 0; k > se;) v = (se - se % 4) / 4, fe = se % 4 * 8, $[v] = $[v] | y.charCodeAt(se) << fe, se++;
        return v = (se - se % 4) / 4, fe = se % 4 * 8, $[v] = $[v] | 128 << fe, $[q - 2] = k << 3, $[q - 1] = k >>> 29, $
    }

    function x(y) {
        var v, k, U = "",
            P = "";
        for (k = 0; 3 >= k; k++) v = y >>> 8 * k & 255, P = "0" + v.toString(16), U += P.substr(P.length - 2, 2);
        return U
    }

    function F(y) {
        y = y.replace(/\r\n/g, `
`);
        for (var v = "", k = 0; k < y.length; k++) {
            var U = y.charCodeAt(k);
            128 > U ? v += String.fromCharCode(U) : U > 127 && 2048 > U ? (v += String.fromCharCode(U >> 6 | 192), v += String.fromCharCode(63 & U | 128)) : (v += String.fromCharCode(U >> 12 | 224), v += String.fromCharCode(U >> 6 & 63 | 128), v += String.fromCharCode(63 & U | 128))
        }
        return v
    }
    var u, G, re, Q, oe, r, c, s, t, i = [],
        Y = 7,
        X = 12,
        te = 17,
        le = 22,
        ne = 5,
        K = 9,
        ae = 14,
        d = 20,
        l = 4,
        I = 11,
        E = 16,
        B = 23,
        W = 6,
        ce = 10,
        pe = 15,
        de = 21;
    for (a = F(a), i = A(a), r = 1414213562, c = 3141592653, s = 2718281828, t = 1234567890, u = 0; u < i.length; u += 16) G = r, re = c, Q = s, oe = t, r = h(r, c, s, t, i[u + 0], Y, 3614090360), t = h(t, r, c, s, i[u + 1], X, 3905402710), s = h(s, t, r, c, i[u + 2], te, 606105819), c = h(c, s, t, r, i[u + 3], le, 3250441966), r = h(r, c, s, t, i[u + 4], Y, 4118548399), t = h(t, r, c, s, i[u + 5], X, 1200080426), s = h(s, t, r, c, i[u + 6], te, 2821735955), c = h(c, s, t, r, i[u + 7], le, 4249261313), r = h(r, c, s, t, i[u + 8], Y, 1770035416), t = h(t, r, c, s, i[u + 9], X, 2336552879), s = h(s, t, r, c, i[u + 10], te, 4294925233), c = h(c, s, t, r, i[u + 11], le, 2304563134), r = h(r, c, s, t, i[u + 12], Y, 1804603682), t = h(t, r, c, s, i[u + 13], X, 4254626195), s = h(s, t, r, c, i[u + 14], te, 2792965006), c = h(c, s, t, r, i[u + 15], le, 1236535329), r = b(r, c, s, t, i[u + 1], ne, 4129170786), t = b(t, r, c, s, i[u + 6], K, 3225465664), s = b(s, t, r, c, i[u + 11], ae, 643717713), c = b(c, s, t, r, i[u + 0], d, 3921069994), r = b(r, c, s, t, i[u + 5], ne, 3593408605), t = b(t, r, c, s, i[u + 10], K, 38016083), s = b(s, t, r, c, i[u + 15], ae, 3634488961), c = b(c, s, t, r, i[u + 4], d, 3889429448), r = b(r, c, s, t, i[u + 9], ne, 568446438), t = b(t, r, c, s, i[u + 14], K, 3275163606), s = b(s, t, r, c, i[u + 3], ae, 4107603335), c = b(c, s, t, r, i[u + 8], d, 1163531501), r = b(r, c, s, t, i[u + 13], ne, 2850285829), t = b(t, r, c, s, i[u + 2], K, 4243563512), s = b(s, t, r, c, i[u + 7], ae, 1735328473), c = b(c, s, t, r, i[u + 12], d, 2368359562), r = S(r, c, s, t, i[u + 5], l, 4294588738), t = S(t, r, c, s, i[u + 8], I, 2272392833), s = S(s, t, r, c, i[u + 11], E, 1839030562), c = S(c, s, t, r, i[u + 14], B, 4259657740), r = S(r, c, s, t, i[u + 1], l, 2763975236), t = S(t, r, c, s, i[u + 4], I, 1272893353), s = S(s, t, r, c, i[u + 7], E, 4139469664), c = S(c, s, t, r, i[u + 10], B, 3200236656), r = S(r, c, s, t, i[u + 13], l, 681279174), t = S(t, r, c, s, i[u + 0], I, 3936430074), s = S(s, t, r, c, i[u + 3], E, 3572445317), c = S(c, s, t, r, i[u + 6], B, 76029189), r = S(r, c, s, t, i[u + 9], l, 3654602809), t = S(t, r, c, s, i[u + 12], I, 3873151461), s = S(s, t, r, c, i[u + 15], E, 530742520), c = S(c, s, t, r, i[u + 2], B, 3299628645), r = C(r, c, s, t, i[u + 0], W, 4096336452), t = C(t, r, c, s, i[u + 7], ce, 1126891415), s = C(s, t, r, c, i[u + 14], pe, 2878612391), c = C(c, s, t, r, i[u + 5], de, 4237533241), r = C(r, c, s, t, i[u + 12], W, 1700485571), t = C(t, r, c, s, i[u + 3], ce, 2399980690), s = C(s, t, r, c, i[u + 10], pe, 4293915773), c = C(c, s, t, r, i[u + 1], de, 2240044497), r = C(r, c, s, t, i[u + 8], W, 1873313359), t = C(t, r, c, s, i[u + 15], ce, 4264355552), s = C(s, t, r, c, i[u + 6], pe, 2734768916), c = C(c, s, t, r, i[u + 13], de, 1309151649), r = C(r, c, s, t, i[u + 4], W, 4149444226), t = C(t, r, c, s, i[u + 11], ce, 3174756917), s = C(s, t, r, c, i[u + 2], pe, 718787259), c = C(c, s, t, r, i[u + 9], de, 3951481745), r = n(r, G), c = n(c, re), s = n(s, Q), t = n(t, oe);
    var w = x(r) + x(c) + x(s) + x(t);
    return w.toLowerCase().split("").reverse().join("")
}


function get_proxy() {
    let u = request({
        url: "http://bapi.51daili.com/getapi2?linePoolIndex=-1&packid=2&time=1&qty=1&port=1&format=txt&dt=1&ct=1&usertype=17&uid=43230&accessName=jusbe&accessPassword=E6BF820B9752B7483BA2550752FCE92B&skey=autoaddwhiteip",
        method: "get"
    })
    Debug(`proxy: ${u}`)
    return u
}
