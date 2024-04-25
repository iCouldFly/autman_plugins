//[title: 顺丰速运]
//[class: 工具类]
//[platform: qq,wx,tg,tb]
//[price: 2]
//[service: Jusbe]
//[admin: false]
//[priority: 1]
//[public: true]
//[bypass: false]
//[disable: false]
//[priority: 1]
//[rule: ^顺丰速运=(https://mcs-mimp-web.sf-express.com/mcs-mimp/share/(app|weChat)/share(GiftReceive)?Redirect)$]
//[description: 适用于 leaf本，命令：顺丰速运=[抓包链接]]

Debug('\n\n\n\n\n<div style="text-align: center; font-size: 72px; font-weight: bold;">顺丰速运</div>')

try{
    importJs('jusapi.js')
}catch(e){
    throw new Error('请在插件市场安装“jusapi”');
}

const ql_name = "🎁福利中心" // 改成你自己的容器名称
const key_name = "sfsyUrl"

const _plugin_name = `【${getTitle()}】` //插件标题
const param1 = param(1)
const imType = GetImType()
const userID = GetUserID()
// const chatID = GetChatID() //会话群号

const ql_data = getQLbyName(ql_name)
const ql = new QingLong(ql_data.host,ql_data.client_id,ql_data.client_secret)

const sfsy_data = ql.getEnvs(key_name)
if(sfsy_data.length){
    ql.putEnv({...sfsy_data[0],...{value:sfsy_data[0].value+"\n"+param1}})
}

sendText(`变量添加成功`)
Debug('================ End ================')
