//[title: 顺丰速运]
//[class: 工具类]
//[platform: qq,wx,tg,tb]
//[price: 2]
//[service: Jusbe]
//[admin: false]
//[priority: 1]
//[public: false]
//[bypass: false]
//[disable: false]
//[open_source: true]是否开源
//[version: 0.0.3 更换变量名及分隔符]
//[priority: 1]
//[rule: ^顺丰速运=(https://mcs-mimp-web.sf-express.com/mcs-mimp/share/(app|weChat)/share(GiftReceive)?Redirect.+)$]
//[description: 命令：顺丰速运=[抓包链接]]

Debug('\n\n\n\n\n<div style="text-align: center; font-size: 72px; font-weight: bold;">顺丰速运</div>')

try {
    importJs('jusapi.js')
} catch (e) {
    throw new Error('请在插件市场安装“jusapi”');
}

const ql_name = "🎁福利中心" // 青龙名
const key_name = "SFSY" // 变量名
const separator = "#" // 分隔符

const _plugin_name = `【${getTitle()}】` //插件标题
const param1 = param(1)

const ql_data = getQLbyName(ql_name)
const ql = new QingLong(ql_data.host, ql_data.client_id, ql_data.client_secret)

ql.addValueInEnv(key_name, separator, param1) // 单环境变量多ck添加，未作去重

sendText(`变量添加成功`)
Debug('================ End ================')//[title: 顺丰速运]
//[class: 工具类]
//[platform: qq,wx,tg,tb]
//[price: 2]
//[service: Jusbe]
//[admin: false]
//[priority: 1]
//[public: false]
//[bypass: false]
//[disable: false]
//[open_source: true]是否开源
//[version: 0.0.3 更换变量名及分隔符]
//[priority: 1]
//[rule: ^顺丰速运=(https://mcs-mimp-web.sf-express.com/mcs-mimp/share/(app|weChat)/share(GiftReceive)?Redirect.+)$]
//[description: 适用于 leaf本，命令：顺丰速运=[抓包链接]]

Debug('\n\n\n\n\n<div style="text-align: center; font-size: 72px; font-weight: bold;">顺丰速运</div>')

try {
    importJs('jusapi.js')
} catch (e) {
    throw new Error('请在插件市场安装“jusapi”');
}

const ql_name = "🎁福利中心" // 青龙名
const key_name = "SFSY" // 变量名
const separator = "#" // 分隔符

const _plugin_name = `【${getTitle()}】` //插件标题
const param1 = param(1)

const ql_data = getQLbyName(ql_name)
const ql = new QingLong(ql_data.host, ql_data.client_id, ql_data.client_secret)

ql.addValueInEnv(key_name, separator, param1) // 单环境变量多ck添加，未作去重

sendText(`变量添加成功`)
Debug('================ End ================')
