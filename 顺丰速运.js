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
//[version: 1.0.4 增加配参设置，适配 qls/qinglong 数据桶]
//[priority: 1]
//[rule: ^顺丰(速运)?=(https://mcs-mimp-web.sf-express.com/mcs-mimp/share/(app|weChat)/share(GiftReceive)?Redirect.+)$]
//[description: 命令》顺丰速运=[抓包链接]<br>说明》仅作提交ck使用，未去重<br>首发：230608]
// [param: {"required":true,"key":"sf_express.ql_name","bool":false,"placeholder":"","name":"容器名称","desc":""}]
// [param: {"required":false,"key":"sf_express.v_name","bool":false,"placeholder":"","name":"变量名","desc":""}]
// [param: {"required":false,"key":"sf_express.separator","bool":false,"placeholder":"","name":"分隔符","desc":""}]

Debug('\n\n\n\n\n<div style="text-align: center; font-size: 72px; font-weight: bold;">顺丰速运</div>')

try {
    importJs('jusapi.js')
} catch (e) {
    throw new Error('请在插件市场安装“jusapi”');
}

const ql_name = bucketGet("sf_express", "ql_name") // 青龙名
const key_name = bucketGet("sf_express", "v_name")||"sfsyUrl" // 变量名
const separator = bucketGet("sf_express", "separator")||"\n" // 分隔符

const _plugin_name = `【${getTitle()}】` //插件标题
// const param1 = param(1)
const param2 = param(2)

const ql_data = getQLS(ql_name)?.[0];if(!ql_data)throw new Error(`未找到容器：${ql_name}`)
const ql = new QingLong(ql_data.host, ql_data.client_id, ql_data.client_secret)

sendText(
ql.addValueInEnv(key_name, separator, param2).msg // 单环境变量多ck添加
)
// sendText(`变量添加成功`)
Debug('================ End ================')
