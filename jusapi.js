//[title: jusapi]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[author: jusbe] 作者
//[platform: all] 适用的平台
//[open_source: false]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.3.4 增加部分青龙相关方法]版本号
//[public: false] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 0] 上架价格
//[description: 需要nodejs依赖: axios,form-data,path,fs<br><br>由于autman原因，市场下载及分发此插件无效。请到此处下载文件: <a href="https://raw.githubusercontent.com/iCouldFly/autman_plugins/scripts/jusapi.js" title="jusapi.js">jusapi.js</a><br>文件存放位置: /autMan/plugin/scripts/<br>市场安装此插件仅用于配参] 使用方法尽量写具体
//[param: {"required":true,"key":"jusapi.host","bool":false,"placeholder":"http://127.0.0.1:8080","name":"host","desc":"autMan 地址"}]
//[param: {"required":true,"key":"jusapi.client_id","bool":false,"placeholder":"","name":"client_id","desc":"系统管理-系统应用-APPID"}]
//[param: {"required":true,"key":"jusapi.client_secret","bool":false,"placeholder":"","name":"client_secret","desc":"系统管理-系统应用-APPSECRET"}]
//[param: {"required":false,"key":"jusapi.ddddocr","bool":false,"placeholder":"如：http://127.0.0.1:7777","name":"DDDOCR 地址","desc":""}]
//[param: {"required":false,"key":"jusapi.appreciate","bool":false,"placeholder":"","name":"收款码地址","desc":"对接的机器人的收款码图片地址，暂无公开项目使用"}]
//[param: {"required":false,"key":"jusapi.win_server","bool":false,"placeholder":"如：http://127.0.0.1:7777","name":"文件服务地址","desc":"jusapi专用windows文件接收服务地址，暂无公开项目使用"}]

const middleware = require('./middleware.js');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path')
const fs = require('fs');

const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID)

class AutAPI {
    constructor(host, client_id, client_secret) {
        const headers = {
            "Accept": "application/json, text/plain, */*",
            "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
            "Accept-Encoding": "gzip, compress, deflate, br"
        }

        /** 获取所有指令
         * @description 
         * @returns {Array}
         */
        this.get_instructions = () => {
            return aut_axios({
                "url": `${this.host}/open/instructions`,
                "method": 'get'
            })
        }

        /** 获取图库目录
         * @description 
         * @returns {Array}
         */
        this.get_gallery = () => {
            return aut_axios({
                "url": `${this.host}/open/gallery`,
                "method": 'get'
            })
        }

        /** 上传图片到图库
         * @description fs.createReadStream('./qrcode.png') post_gallery: 400 - 上传失败!
         * @param {*} data imgUrl[string]网络图片 | imgfile[file]
         * @returns {*} 
         */
        this.post_gallery = (data) => {
            // let d = typeof data == "string" ? { imgUrl: data } : { imgfile: data }
            var data = new FormData();
            // data.append('imgUrl', '');
            // data.append('imgfile', fs.createReadStream(filePath));
            data.append('imgfile', data);
            return aut_axios({
                "url": `${this.host}/open/gallery`,
                "method": 'post',
                "data": data
            })
        }

        /** 日志内容
         * @description * 240415 请求返回401 - "未登陆"
         * @param {string} filepath 日志文件路径 /autMan/task/logs/.../...log
         * @returns 
         */
        this.get_log = (filepath) => {
            const p = /(?<=\/autMan\/task\/logs\/).*/.exec(filepath)
            if (Array.isArray(p)) {
                const ps = p[0].split("/")
                const filename = encodeURIComponent(ps.pop())
                const path = encodeURIComponent(ps.join("/"))
                // console.log("Authorization -", headers.Authorization)
                return aut_axios({
                    "url": `${this.host}/open/logs/${filename}?path=${path}`,
                    "method": 'get'
                })
            } else {
                return rebug(`【AutAPI】 get_log: 路径错误：${filepath}`, false)
            }
        }

        /** 日志目录树
         * @description * 240415 请求返回401 - "未登陆"
         * @returns 
         */
        this.get_logs_memu = () => {
            // console.log("Authorization -", headers.Authorization)
            return aut_axios({
                "url": `${this.host}/open/logs/memu`,
                "method": 'get'
            })
        }

        /** 引入/安装依赖
         * @description MODULE_NOT_FOUND 时自动安装依赖，安装后需重新运行插件
         * @param {string} ...module_name
         * @returns 
         */
        this.require = async (...args) => {
            const ary = new Array()
            for (let module_name of args) {
                let r
                try {
                    r = require(module_name)
                    rebug(`【AutAPI/require】 载入模块: ${module_name}`, true)
                } catch (e) {
                    r = null
                    rebug(`【AutAPI/require】 载入模块失败，尝试安装: ${module_name}`)
                    if (e.code == "MODULE_NOT_FOUND") {
                        await s.reply(`尝试安装依赖: ${module_name}`)
                        let response = await this.post_dependencies([{ name: module_name, type: "nodejs" }])
                        if (response.code == 200) {
                            await s.reply("开始安装")
                            for (let i = 1; i <= 3; i++) {
                                console.log(await sleep(5))
                                await s.reply(`依赖安装中 ${".".repeat(i)}`)
                                response = await this.get_dependencies(module_name)
                                rebug(`【AutAPI/require】查询依赖安装结果: ${JSON.stringify(response)}`)
                                if (response.code == 200) {
                                    if (response.data[0].status == 1) {
                                        await s.reply(`依赖安装成功: ${module_name}`)
                                        break
                                    }
                                } else {
                                    await s.reply("依赖状态检测失败, 跳过")
                                    break
                                }
                            }
                            if (response.data[0].status != 1) await s.reply("依赖安装失败: " + module_name)
                        } else {
                            await s.reply("依赖安装失败，跳过: " + module_name)
                        }
                    } else {
                        rebug(JSON.stringify(e))
                        await s.reply("加载依赖失败，未知错误")
                    }
                }
                ary.push(r)
            }
            return ary
        }

        /** 安装依赖
         * @description 安装依赖，返回log = /autMan/task/logs/dependencies/20240415-224600.log
         * @param {Array} data:[{name,type},...] // nodejs,python,golang,linux
         * @returns {Array} data:[{id,name,specifiedVersion,version,type,status,log,remark,createdAt,updatedAt}]
         */
        this.post_dependencies = (data) => {
            return aut_axios({
                "url": `${this.host}/open/dependencies`,
                "method": 'post',
                "data": data
            })
        }

        /** 获取依赖
         * @description 获取依赖
         * @param {string} searchValue 搜索关键词 可选
         * @returns {Array} data:[{id,name,specifiedVersion,version,type,status,log,remark,createdAt,updatedAt},...]
         */
        this.get_dependencies = (searchValue = "") => {
            return aut_axios({
                "url": `${this.host}/open/dependencies?searchValue=${searchValue}`,
                "method": 'get'
            })
        }

        /** 获取依赖安装日志
         * @description 
         * @param {string} id 必须
         * @returns {string} data
         */
        this.get_dependencies_log = (id) => {
            return aut_axios({
                "url": `${this.host}/open/dependencies/${id}/log`,
                "method": 'get'
            })
        }

        /** 查询用户
         * @description * 240415 不支持 searchValue，501
         * @returns data:[{id,name,pwd,email,qq,qb,wx,wb,tg,wxmp,wxsv,regdate,alipay,code,point,signdate,coin,charm,prize,url,date,memo,other},...]
         */
        this.get_users = () => {
            return aut_axios({
                "url": `${this.host}/open/users?searchValue=`,
                "method": 'get'
            })
        }

        /** 修改用户
         * @description 
         * @returns 
         */
        this.put_users = (data) => {
            s.reply(JSON.stringify(data))
            return aut_axios({
                "url": `${this.host}/open/users`,
                "method": 'PUT',
                "data": JSON.stringify(data)
            })
        }

        /** 获取昵称和ID对照集合
         * @description 获取昵称和ID对照集合
         * @param {string} searchValue 搜索关键词 可选
         * @param {number} page 搜索关键词 可选
         * @param {number} pageSize 搜索关键词 可选
         * @returns data:[{id,imtype,ischat,type,uid,name},...]
         */
        this.get_nameids = (searchValue = "", page = "", pageSize = "") => {
            return aut_axios({
                "url": `${this.host}/open/nameids?searchValue=${searchValue}&page=${page}&pageSize=${pageSize}`,
                "method": 'get'
            })
        }

        /** 获取多个（指定id）COOKIE识别规则
         * @description
         * @param {number} id 
         * @returns 
         */
        this.get_varckmaps = (id = null) => {
            return aut_axios({
                "url": this.host + "/open/varckmaps" + (id ? "/" + id : ""),
                "method": "get"
            });
        };

        /** 新增COOKIE识别规则
         * @description
         * @param {*} body 
         * @returns 
         */
        this.post_varckmaps = body => {
            return aut_axios({
                "url": this.host + "/open/varckmaps",
                "method": "post",
                "data": body
            });
        };

        /** 修改COOKIE识别规则
         * @description
         * @param {*} body 
         * @returns 
         */
        this.put_varckmaps = body => {
            return aut_axios({
                "url": this.host + "/open/varckmaps",
                "method": "put",
                "data": body
            });
        };

        /** 处理COOKIE识别规则
         * @description 
         * @param {string} action 
         * @returns 
         */
        this.put_varckmaps_action = action => {
            return aut_axios({
                "url": this.host + "/open/varckmaps/" + action,
                "method": "put"
            });
        };

        /** 删除COOKIE识别规则
         * @description
         * @param {*} body 
         * @returns 
         */
        this.delete_varckmaps = body => {
            return aut_axios({
                "url": this.host + "/open/varckmaps",
                "method": "delete",
                "data": body
            });
        };

        /** 获取定时发送规则集合
         * @description 使用token获取定时发送规则的集合
         * @param {string} searchValue 搜索关键词 可选
         * @returns data:[{id,disable,cron,last_running_time,next_running_time,cmd,to_self,disguise_imtype,disguise_group,disguise_user,to_others,memo},...]
         */
        this.get_croncmds = (searchValue = "") => {
            return aut_axios({
                "url": `${this.host}/open/croncmds?searchValue=${searchValue}`,
                "method": 'get'
            })
        }

        /** 获取某个定时发送规则
         * @description 使用token获取定时发送规则的集合
         * @param {number} id 任务ID
         * @returns data:[{id,disable,cron,last_running_time,next_running_time,cmd,to_self,disguise_imtype,disguise_group,disguise_user,to_others,memo},...]
         */
        this.get_croncmd_by_id = (id) => {
            return aut_axios({
                "url": `${this.host}/open/croncmds/${id}`,
                "method": 'get'
            })
        }

        /** 修改定时发送规则
         * @description 
         * @param {object} data {id,cron,cmd,to_self,to_others,memo}
         * @returns 
         */
        this.put_croncmds = (data) => {
            const { id, disable, cron, cmd, to_self, disguise_imtype, disguise_group, disguise_user, to_others, memo } = data
            return aut_axios({
                "url": `${this.host}/open/croncmds`,
                "method": 'PUT',
                "data": { id, disable, cron, cmd, to_self, disguise_imtype, disguise_group, disguise_user, to_others, memo }
            })
        }

        /** 增加定时发送规则
         * @description 
         * @param {Array} data [{cron,cmd,to_self,to_others,memo}]
         * @returns 
         */
        this.post_croncmds = (data = { cron, cmd, to_self, to_others, memo }) => {
            return aut_axios({
                "url": `${this.host}/open/croncmds`,
                "method": 'POST',
                "data": data
            })
        }

        /** 删除定时发送规则
         * @description 
         * @param {Array} data [...ids]
         * @returns 
         */
        this.del_croncmds = (data = []) => {
            return aut_axios({
                "url": `${this.host}/open/croncmds`,
                "method": 'DELETE',
                "data": data
            })
        }

        /** 插件的加密分发
         * @description es5、python、shell、nodejs、php、golang
         * @param {string} data {title 插件名称(要进行url编码),language 插件编程语言,content 插件内容,key 目标用户的云账户}
         * @returns 
         */
        this.post_encrypt = (data) => {
            return aut_axios({
                "url": `${this.host}/open/js/encrypt`,
                "method": 'post',
                "data": JSON.stringify(data)
            })
        }

        /** 获取系统授权token，有效时间30分钟
         * @description 几乎所有接口要使用该接口获取的token值，将Bearer {token}作为header中Authorization进行访问请求
         * @param {string} host autman地址
         * @param {string} client_id autman应用ID
         * @param {string} client_secret autman应用秘钥
         * @returns 
         */
        function get_token(host, client_id, client_secret) {
            return aut_axios({
                "url": `${host}/open/auth/token?client_id=${client_id}&client_secret=${client_secret}`,
                "method": 'get'
            })
        }

        /** autman 通用请求封装
         * @description autman 通用请求封装
         * @param {object} config 
         * @returns 
         */
        function aut_axios(config) {
            return axios({
                ...{ "headers": headers, "redirect": 'follow', "responseType": "json" },
                ...config
            })
                .then(({ config, data: { message, code, data } }) => {
                    return rebug(`【AutAPI/${config.method}/${new URL(config.url).pathname.split("/").pop()}】${code} - \"${message ? message : ""}\"`, code == 200, code, data)
                })
                .catch(response => {
                    // console.error(JSON.stringify(response))
                    // console.error(response["status"]) - undefined
                    // 401 - ERR_BAD_REQUEST
                    return rebug(
                        `【AutAPI/${response.config.method}/${new URL(response.config.url).pathname.split("/").pop()}】[${response.name + ": " || ""}]${response.status || response.code} - ${response.statusText || response.message || response.msg || ""}`,
                        false,
                        response.status,// || response.code,
                        response.stack || response.data || null
                    )
                });
        }

        // 异步构造方法
        return new Promise(
            async (resolve, reject) => {
                this.host = host || await middleware.bucketGet("jusapi", "host")
                this.client_id = client_id || await middleware.bucketGet("jusapi", "client_id")
                this.client_secret = client_secret || await middleware.bucketGet("jusapi", "client_secret")
                if (!this.host || !this.client_id || !this.client_secret) { console.error("【jusapi】请设置配参: autman 系统应用"); process.exit() }
                await get_token(this.host, this.client_id, this.client_secret)
                    .then(result => {
                        if (result.success) {
                            headers.Authorization = `${result.data.token_type || ""} ${result.data.token || ""}`
                        } else {
                            s.reply("autapi 连接失败，请检查 jusapi.js(nodejs) 配参")
                            headers.Authorization = undefined
                        }
                        rebug(`【AutAPI】 ${this.host} - ${headers.Authorization}`, true)
                        resolve(this)
                    })
                    .catch(e => console.err(e))
            }
        )
    }
}

class QingLong {
    constructor(...args) {
        if (!args[0]) return rebug("青龙连接失败，请检查青龙配置", false)
        else if (args.length == 3) var [host, client_id, client_secret] = args;
        else if (args.length == 1 && ["host", "client_id", "client_secret"].every(e => e in args[0])) var { host, client_id, client_secret } = args[0];
        else { console.error("【QingLong】输入参数有误:", JSON.stringify(args)); }//throw new Error("青龙连接失败，详见实时日志"); }
        if (!(host && client_id && client_secret)) { console.error("【QingLong】输入参数有误:", JSON.stringify(args)); throw new Error("青龙连接失败，详见实时日志"); }

        const headers = new Object({ "Content-Type": "application/json;charset=UTF-8" });

        /** 获取所有（指定）任务
         * @description
         * @param {string} searchValue 搜索关键词，可以为空
         * @returns {*}
         */
        this.getCrons = function (searchValue = "") {
            return qaxios({ "url": `${host}/open/crons?searchValue=${encodeURIComponent(searchValue)}&t=${Date.now()}` });
        };

        /** 运行指定任务
         * @description
         * @param {*} ids 任务id
         * @returns {*}
         */
        this.runCrons = function (...args) {
            let body;
            if (args.length == 1) {
                if (Array.isArray(args[0])) body = args[0]
                else body = [args[0]]
            } else {
                body = args
            }

            return qaxios({
                "url": `${host}/open/crons/run?t=${Date.now()}`,
                "method": "put",
                "data": body
            });
        };

        /** 禁用指定任务
         * @description
         * @param {*} ids 任务id
         * @returns {*}
         */
        this.disCrons = function (...args) {
            let body;
            if (args.length == 1) {
                if (Array.isArray(args[0])) body = args[0]
                else body = [args[0]]
            } else {
                body = args
            }

            return qaxios({
                "url": `${host}/open/crons/disable?t=${Date.now()}`,
                "method": "put",
                "data": body
            });
        };

        /** 启用指定任务
         * @description
         * @param {*} ids 任务id
         * @returns {*}
         */
        this.enCrons = function (...args) {
            let body;
            if (args.length == 1) {
                if (Array.isArray(args[0])) body = args[0]
                else body = [args[0]]
            } else {
                body = args
            }

            return qaxios({
                "url": `${host}/open/crons/enable?t=${Date.now()}`,
                "method": "put",
                "data": body
            });
        };

        /** 获取所有（指定）变量
         * @description
         * @param {string} searchValue 搜索关键词，可以为空
         * @returns {*}
         */
        this.getEnvs = function (searchValue = "") {
            return qaxios({ "url": host + "/open/envs?searchValue=" + encodeURIComponent(searchValue) + "&t=" + Date.now() });
        };

        /** 创建（多个）变量
         * @description 用例: createEnvs("name","value","remarks");
         * @description 用例: createEnvs([{name:"name",value:"value",remarks:"remarks"},{},...],[{},...],...);
         * @description 用例: createEnvs({name:"name",value:"value",remarks:"remarks"},{},...);
         * @param  {string} name 变量名
         * @param  {string} value 变量值
         * @param  {string} remarks 备注
         * @returns {*}
         */
        this.createEnvs = function (...args) {
            let body;
            if (args.length == 3 && args.every(e => typeof e == "string" || typeof e == "number")) body = [{ "name": args[0], "value": args[1], "remarks": args[2] }];
            else if (args.every(e => Array.isArray(e) && e.every(ee => Object.keys(ee).every(eee => ["name", "value", "remarks"].includes(eee))))) body = args.flat();
            else if (args.every(e => typeof e == "object" && Object.keys(e).every(ee => ["name", "value", "remarks"].includes(ee)))) body = args;
            else return rebug("【QingLong/createEnvs】入参有误: " + JSON.stringify(args));

            return qaxios({
                "url": host + "/open/envs?t=" + Date.now(),
                "method": "post",
                "data": body
            });
        };

        /** 修改指定id变量
         * @description 用例: putEnv(1,"name","value","remarks");
         * @description 用例: putEnv({id:1,name:"name",value:"value",remarks:"remarks"});
         * @param  {number} id 变量id
         * @param  {string} name 变量名
         * @param  {string} value 变量值
         * @param  {string} remarks 备注
         * @returns {*}
         */
        this.putEnv = function (...args) {
            let body;
            if (args.length == 4 && args.every(e => typeof e == "string" || typeof e == "number")) body = { "id": args[0], "name": args[1], "value": args[2], "remarks": args[3] };
            else if (args.length == 1 && ["id", "name", "value", "remarks"].every(_0x19c596 => Object.keys(args[0]).includes(_0x19c596))) body = { "id": args[0].id, "name": args[0].name, "value": args[0].value, "remarks": args[0].remarks };
            else return rebug("【QingLong/putEnv】入参有误: " + JSON.stringify(args));

            return qaxios({
                "url": host + "/open/envs?t=" + Date.now(),
                "method": "put",
                "data": body
            });
        };

        /** 删除指定id变量
         * @description 用例: delEnvs(1,2,3,...);
         * @description 用例: delEnvs("1,2,3,...");
         * @description 用例: delEnvs([1,2,3,...]);
         * @param  {...any} ids 
         * @returns {*}
         */
        this.delEnvs = function (...ids) {
            let body;
            if (ids.every(e => typeof e == "number" || typeof e == "string" && e + 1)) body = ids;
            else if (ids.length == 1 && typeof ids[0] == "string" && /^\d+(,\d+)*$/.test(ids[0])) body = ids[0].split(",");
            else if (ids.length == 1 && Array.isArray(ids[0]) && ids[0].every(e => typeof e == "number" || typeof +e == "number")) body = ids[0];
            else return rebug("【QingLong/delEnvs】入参有误: " + JSON.stringify(ids));

            return qaxios({
                "url": host + "/open/envs?t=" + Date.now(),
                "method": "delete",
                "data": JSON.stringify(body)
            });
        };

        /** 获取 qinglong api token
         * @description
         * @param {string} host 
         * @param {string} client_id 
         * @param {string} client_secret 
         * @returns {*}
         */
        function getToken(host, client_id, client_secret) {
            return qaxios({
                "url": host + "/open/auth/token?client_id=" + client_id + "&client_secret=" + client_secret
            });
        }

        // 获取版本信息
        function getVersion() {
            return qaxios({
                "url": host + "/open/system"
            });
        }

        // QingLong 通用请求封装
        function qaxios(config) {
            return config.headers = { ...headers, ...config.headers },
                axios({ ...{ "method": "get", "timeout": 3000 }, ...config })
                    .then(({ status, statusText, headers, config, request: request, data }) =>
                        rebug("【QingLong/" + config.method + "/" + new URL(config.url).pathname.split("/").pop() + "】" + (data?.["code"] || status) + " - " + statusText, true, status, data?.["data"] || data)
                    )
                    .catch(({ message, name, code, config, request, response: response }) =>
                        rebug("【QingLong/" + config.method + "/" + new URL(config.url).pathname.split("/").pop() + "】[" + name + "]" + (response?.["data"]?.["code"] || response?.["status"] || code) + " - " + (response?.["data"]?.["message"] || response?.["statusText"] || message), false, response?.["data"]?.["code"] || response?.["status"] || code, response?.["data"])
                    );
        }

        // 异步构造函数
        return new Promise(async (resolve, reject) => {
            rebug("【QingLong】连接青龙：" + host, 1);
            await getToken(host, client_id, client_secret).then(response => {
                if (response.code !== 200) reject(response.message);
                this.host = host;
                headers.Authorization = response.data?.["token_type"] + " " + response.data?.["token"];
                rebug(`【QingLong】Authorization: ${headers.Authorization}`)

                getVersion()
                    .then(({ message, success, code, data }) => {
                        if (code !== 200) reject(message);

                        this.isInitialized = data?.["isInitialized"];
                        this.version = data?.["version"];
                        this.publishTime = data?.["publishTime"];
                        this.branch = data?.["branch"];
                        this.changeLog = data?.["changeLog"];
                        this.changeLogLink = data?.["changeLogLink"];
                        this.success = success;
                        this.code = code
                        rebug(`【QingLong】isInitialized: ${this.isInitialized}`,1)
                        rebug(`【QingLong】version: ${this.version}`,1)
                        rebug(`【QingLong】publishTime: ${this.publishTime}`,1)
                        rebug(`【QingLong】branch: ${this.branch}`,1)
                        rebug(`【QingLong】changeLog: ${this.changeLog}`,1)
                        rebug(`【QingLong】changeLogLink: ${this.changeLogLink}`,1)
                        // rebug(`【QingLong】success: ${this.success}`)
                        // rebug(`【QingLong】code: ${this.code}`)

                        resolve(this);
                    });
            });
        });
    }
}

/** 获取 autman 所有（指定）容器配置
 * @description 用例: getQLS();   getQLS("福利中心")
 * @param {string} ql_name 容器名称
 * @returns {Array}
 */
async function getQLS(ql_name = null) {
    let ary = new Array(),
        qls = await s.bucketAllKeys("qls");
    if (Array.isArray(qls) && qls.length) {
        for (let index of qls) ary.push(JSON.parse(await s.bucketGet("qls", index)));
    } else try {
        ary = JSON.parse(await s.bucketGet("qinglong", "QLS"));
    } catch (e) {
        return rebug("【jusapi】【getQLS】青龙列表读取错误，请检查系统配置", 0);
    }
    if (ql_name) ary = ary.filter(v => v.name.includes(ql_name))
    if (ary.length && ary[0]) return rebug("【getQLS】查找青龙：" + (ql_name ? ql_name : "ALL"), true, 200, ary);
    else return rebug("【getQLS】未查找青龙：" + (ql_name ? ql_name : "ALL") + "，请检查名称或权限", false, 404, ary);
}

class WxPusher {
    constructor(appToken) {
        this.appToken = appToken
        if (!appToken) return rebug("请设置 appToken")
        if (typeof appToken != "string") return rebug(`appToken 格式错误: ${appToken}`)

        this.getUID = async function () {
            let qr_data = await this.create_qrcode("by jusapi"), scan_data
            if (!qr_data.success) return rebug(`【WxPusher/getUID】获取二维码失败: ${qr_data.message}`)

            let msg = s.reply(`请在 ${module.exports.inputTime} 秒内使用微信扫描二维码（q 取消）:`),
                imsg = s.replyImage(qr_data.data.url),
                quit
            for (let i = 0; i < module.exports.inputTime; i += 10) {
                quit = await s.input(10000, 1, false)
                    .then(d => {
                        if (!d) return rebug("【inputReg】 输入超时", true, 408, e)
                        if (/^q$/i.test(d)) return rebug("【inputReg】 用户取消")
                        if (reg) if (!reg.test(d)) return rebug(`【inputReg】 输入错误（${reg}）: ${d}`, false, 401, d)
                        return rebug(`【inputReg】 输入: ${d}`, true, 200, d)
                    })
                    .catch(e => rebug("【inputReg】 输入超时", false, 408, e))

                scan_data = await this.scan_qrcode_uid(qr_data.data.code)

                if (scan_data.success) return s.recallMessage(msg), s.recallMessage(imsg), scan_data
                else if (quit.code != 408) return s.recallMessage(msg), s.recallMessage(imsg), quit
            }
        }

        /** 申请二维码
         * @description
         * @param {string} extra 携带信息
         * @param {number} validTime 超时（秒）
         * @returns {*} data:{expires,code,shortUrl,extra,url}
         */
        this.create_qrcode = function (extra, validTime = module.exports.inputTime) {
            if (!extra || typeof extra != "string") return rebug(`【WxPusher/create/qrcode】extra 格式错误: ${extra}`)
            return waxios({
                url: "https://wxpusher.zjiecode.com/api/fun/create/qrcode",
                method: "post",
                data: {
                    appToken: appToken,
                    extra: extra,
                    validTime: validTime
                }
            })
        }

        /** 扫码检测
         * @description
         * @param {string} code 识别码
         * @returns {*} data:"UID_Uo..."
         */
        this.scan_qrcode_uid = function (code) {
            if (!code || typeof code != "string") return rebug(`【WxPusher/fun/scan-qrcode-uid】code 格式错误: ${code}`)
            return waxios({ url: `https://wxpusher.zjiecode.com/api/fun/scan-qrcode-uid?code=${code}` })
        }

        // 通用请求封装
        function waxios(body) {
            return axios(body)
                .then(({ status, statusText, headers, config, request, data: { code, msg, data, success } }) =>
                    rebug(`【WxPusher/${new URL(config.url).pathname.split("/").slice(-2).join("/")}】` + (msg || statusText), success, code || status, data))
                .catch(({ hostname, syscall, code, errno, message, stack, name, config, request }) =>
                    rebug(`【WxPusher/${new URL(config.url).pathname.split("/").slice(-2).join("/")}】` + (`[${name}]${errno} - ${code}, ${message}`)))
        }

        return this
    }
}

/** xzxxn777/ddddocr
 * 来源: https://github.com/xzxxn777/ddddocr
 */
class DDDDOCR {
    /** constructor
     * @param {string} host 接口地址: http://ip:7777
     * @returns 
     */
    constructor(host = null) {

        /** 滑块验证 https://github.com/xzxxn777/ddddocr#%E6%BB%91%E5%9D%97%E9%AA%8C%E8%AF%81
         * @description 滑块验证码识别函数，接收两个图像和一个simple_target参数，返回滑块的目标位置
         * @param {url/base64/byte} slidingImage 
         * @param {url/base64/byte} backImage
         * @param {*} simple_target 
         * @returns 
         */
        this.capcode = function (data = { "slidingImage": null, "backImage": null, "simple_target": null }) {
            return daxios({ "url": this.host + "/capcode", "method": "post", "data": data });
        };

        /** ocr识别 https://github.com/xzxxn777/ddddocr#ocr%E8%AF%86%E5%88%AB
         * @description OCR识别函数，接收一个图像和一个png_fix参数，返回OCR识别结果
         * @param {url/base64/byte} image 
         * @returns 
         */
        this.classification = function (data = { "image": null }) {
            return daxios({ "url": this.host + "/classification", "method": "post", "data": data });
        };

        /** 位置识别 https://github.com/xzxxn777/ddddocr#%E4%BD%8D%E7%BD%AE%E8%AF%86%E5%88%AB
         * @description 检测函数，接收一个图像，返回图像上的所有文字或图标的坐标位置
         * @param {url/base64/byte} image 
         * @returns 
         */
        this.detection = function (data = { "image": null }) {
            return daxios({ "url": this.host + "/detection", "method": "post", "data": data });
        };

        /** 数字计算 https://github.com/xzxxn777/ddddocr#%E6%95%B0%E5%AD%97%E8%AE%A1%E7%AE%97
         * @description 计算类验证码处理函数，接收一个图像，返回计算结果
         * @param {url/base64/byte} image 
         * @returns 
         */
        this.calculate = function (data = { "image": null }) {
            return daxios({ "url": this.host + "/calculate", "method": "post", "data": data });
        };

        /** 滑块对比 https://github.com/xzxxn777/ddddocr#%E6%BB%91%E5%9D%97%E5%AF%B9%E6%AF%94
         * @description 滑块对比函数，接收两个图像，返回滑块的目标位置
         * @param {url/base64/byte} slidingImage 
         * @param {url/base64/byte} backImage 
         * @returns 
         */
        this.slideComparison = function (data = { "slidingImage": null, "backImage": null }) {
            return daxios({ "url": this.host + "/slideComparison", "method": "post", "data": data });
        };

        /** 图片分割 https://github.com/xzxxn777/ddddocr#%E5%9B%BE%E7%89%87%E5%88%86%E5%89%B2
         * @description 图片分割处理函数，接收一个图像，返回计算结果
         * @param {url/base64/byte} image 
         * @param {*} y_coordinate 
         * @returns 
         */
        this.crop = function (data = { "image": null, "y_coordinate": null }) {
            return daxios({ "url": this.host + "/crop", "method": "post", "data": data });
        };

        /** 图片点选 https://github.com/xzxxn777/ddddocr/tree/master#%E5%9B%BE%E7%89%87%E7%82%B9%E9%80%89
         * @description 点选处理函数，接收一个图像，返回计算结果
         * @param {url/base64/byte} image 
         * @returns 
         */
        this.select = function (data = { "image": null }) {
            return daxios({ "url": this.host + "/select", "method": "post", "data": data });
        };

        // ddddocr 通用请求
        function daxios(config) {
            return config.headers = { ...{ "Content-Type": "application/json" }, ...config.headers },
                axios({ ...{ "method": "get" }, ...config })
                    .then(({ status, statusText, headers, config, request, data }) =>
                        rebug("【 DDDDOCR/" + new URL(config.url).pathname.split("/").pop() + " 】" + status + " - " + statusText, true, status, data))
                    .catch(({ message, name, code, config, request, response }) =>
                        rebug("【 DDDDOCR/" + new URL(config.url).pathname.split("/").pop() + " 】[" + name + "]" + code + " - " + message, false, code, null));
        }

        // 异步构造函数
        return new Promise(async (resolve, reject) => {
            this.host = host || (await middleware.bucketGet("jusapi", "ddddocr"));
            this.host || reject("【 DDDDOCR 】请设置配参 ddddocr")

                (await daxios({ "url": this.host })).code == 200 ?
                resolve(this) :
                reject("【 DDDDOCR 】DDDDOCR 连接失败");
        });
    }
}

/** 额外通知
 * @description 额外通知
 * @param {string} target 通知目标，格式：qqgroup:123,wxindiv:456
 * @param {string} content 通知内容
 */
async function sendNotify(target, content) {
    if (!/([a-z]+:[a-z\d\-]+,?)+/.test(target)) return rebug(`【sendNotify】目标参数格式错误`, false, 401, content)

    await Promise.all(
        target.split(",").map(v => {
            const [im, id] = v.split(":")
            return { im: im, id: id }
        }).map(v => {
            if (v.im) {
                let imType, groupCode, userID
                imType = /^.*(?=(group|indiv))/i.exec(v.im)[0]
                groupCode = /group/i.test(v.im) ? v.id : null
                userID = /indiv/i.test(v.im) ? v.id : null

                rebug(`【sendNotify】[${imType}]${v.id} 开始推送`, true)
                try { return middleware.push(imType, groupCode, userID, "", content) }
                catch (e) { rebug(`【sendNotify】[${imType}]${v.id} 推送异常`) }
            }
        })
    )
    return rebug(`【sendNotify】推送完成`, true, 200, content)
}

/** 调试输出
 * @description 开启调试功能请给机器人发送：set jusapi isDebug true
 * @param {string} message 输出消息
 * @param {boolean} success 返回是否成功，可选
 * @param {number} code 返回状态码，可选
 * @param {object} data 返回数据，可选
 * @returns {*}
 */
function rebug(message, success = false, code = 0, data = null, _message = null) {
    let title = /^【.*】\s?/.exec(message)
    title = title ? title[0] : '【rebug】'
    let msg = message.replace(/^【[^】]+】/, '')
    if (module.exports.isDebug) {
        let type = typeof message
        if (type == 'object') {
            if (Array.isArray(message)) { type = "array" }
            else if (message instanceof RegExp) { type = "regexp" }
            else if (message == null) { type = "null" }
        }

        if (success) {
            // console.log(message)
            console.log('\033[40;32m', title, '\033[42;30m', type, ":", msg, '\033[0m')
        } else {
            console.error(message)
        }
    }
    return { message: _message || msg.replace(/^【.+?】 /, ""), success: success, code: code, data: data }
}

/** 本地生成二维码
 * @description
 * @param {string} content 二维码内容
 * @returns { local: local, lan: lan }
 */
async function encodeQR(content) {
    const aut_api = await new AutAPI()
    const [qr_image, uuid] = await aut_api.require("qr-image", "uuid")

    const filename = uuid.v4() + ".png"
    const host = await middleware.bucketGet("jusapi", "host")
    const lan = `${host}/tmp/static/${filename}`
    const local = `${path.resolve("../web/tmp/static")}/${filename}`

    const qr_code = qr_image.image(content, { ec_level: "H", type: "png", size: 10 });
    qr_code.pipe(fs.createWriteStream(local))

    return rebug(`【 encodeQR 】URL: ${lan}，本地路径: ${local}`, true, 200, { local: local, lan: lan })
}

/** resend**/
async function resend(message, success = false, code = 0, data = null) {
    const _msg = await s.reply(message)
    if (module.exports.recallTime && _msg) setTimeout(() => { s.recallMessage(_msg[0]).catch(e => rebug(`【 resend 】撤回用户消息失败`)) }, module.exports.recallTime * 1000);
    return rebug(`【 resend 】 success: ${success}`, success, code, data)
}

/** sleep
 * @description 示例：await sleep(60)
 * @param {number} s 秒
 * @returns {*}
 */
function sleep(s = 1) {
    return new Promise(resolve => setTimeout(() => resolve(), s * 1000));
};

/** 捕获用户输入
 * @description 示例：
 * @param {string} tip 输入提示，可选
 * @param {RegExp} reg 输入验证，可选
 * @returns 
 */
async function inputReg(tip = null, reg = null) {

    module.exports.recallTime && tip && s.recallMessage(await s.getMessageID()).catch(e => rebug(`【 inputReg 】撤回用户消息失败`))
    // if (module.exports.recallTime && tip) try { s.recallMessage(await s.getMessageID()) } catch (e) { rebug(`【 inputReg 】撤回用户消息失败`) }

    // let msg = tip ? await s.reply(tip).catch(error => rebug("【inputReg】 系统错误", false, 500, error)) : null
    try { var msg = tip ? await s.reply(tip) : null } catch (error) { return rebug("【inputReg】 系统错误", false, 500, error) }
    // let shuru = await s.listen(module.exports.inputTime * 1000)
    let shuru = await s.input(module.exports.inputTime * 1000, 1, false)
        .then(d => {
            if (!d) return rebug("【inputReg】 输入超时", true, 408, e)
            if (/^q$/i.test(d)) return rebug("【inputReg】 用户取消")
            if (reg) if (!reg.test(d)) return rebug(`【inputReg】 输入错误（${reg}）: ${d}`, false, 401, d)
            return rebug(`【inputReg】 输入: ${d}`, true, 200, d)
        })
        .catch(e => rebug("【inputReg】 输入超时", false, 408, e))
    if (module.exports.recallTime && tip) {
        rebug("【 inputReg 】撤回 tip")
        // try { s.recallMessage(msg[0]) } catch (e) { rebug(`【 inputReg 】撤回机器人消息失败，ID: ${msg[0]}`) }
        s.recallMessage(msg?.[0]).catch(e => rebug(`【 inputReg 】撤回机器人消息失败，ID: ${msg?.[0]}`))

        // try { s.recallMessage(await s.getMessageID()) } catch (e) { rebug(`【 inputReg 】撤回用户消息失败`) }
        s.recallMessage(await s.getMessageID()).catch(e => rebug(`【 inputReg 】撤回用户消息失败`))
    }

    return shuru
}

/** 捕获用户支付
 * @description 示例：
 * @param {string} tip 输入提示，可选
 * @returns 
 */
async function waitPay(tip = null) {
    let appreciate = module.exports.appreciate
    if (!appreciate) return rebug(`【waitPay】 获取收款码失败`, false, 502, false)
    // if (/^true$/i.test(await middleware.bucketGet("jusapi", "atWaitPay"))) return rebug(`【waitPay】 他人支付中，请稍后重试`, false, 503, false)
    if (await s.atWaitPay()) return rebug(`【waitPay】 他人支付中，请稍后重试`, false, 503, false)

    const im = await s.getImtype()
    if (/^(qb)|(tb)|(ds)|(kk)|(dd)|(ss)$/i.test(im)) {
        rebug(`【waitPay】 当前平台【${im}】需要转链`, 1)
        appreciate = await img2aut(appreciate)
        if (appreciate.success) appreciate = appreciate.data
        else return appreciate
    }

    // await middleware.bucketSet("jusapi", "atWaitPay", "true")
    const _tip = tip || `请在 ${module.exports.payTime} 秒内使用微信扫码完成支付（q 退出）`
    try {
        var _msg = await s.reply(_tip)
        var _img = await s.replyImage(appreciate)
    } catch (error) { return rebug("【 waitPay 】 系统错误", false, 500, error) }
    rebug(`【waitPay】 等待支付，收款码: ${appreciate}`, 1)

    let exit_msg
    const pay = await s.waitPay("q", module.exports.payTime * 1000)
        .then(async d => {
            exit_msg = await s.getMessageID()

            if (typeof d == 'string') return rebug(`【waitPay】退出`, false, 0, "退出")
            // q
            else return rebug(`【waitPay】支付完成`, true, 200, d)
            // {"Time":"2024-05-29T18:35:27.123437394+08:00","Type":"微信赞赏","FromWxid":"","FromName":"Jusbe","Money":1}
        })
        .catch(e => {
            if (e.data) return rebug(`【waitPay_ed】${e.data.message}`, false, e.data.status, e.data)
            else return rebug(`【waitPay_e】${e.message}`, false, e.status || e.code, e)
        })
    // await middleware.bucketSet("jusapi", "atWaitPay", "false")
    if (module.exports.recallTime && _msg) {
        console.log(exit_msg)
        await s.recallMessage(exit_msg)
        await s.recallMessage(_img[0])
        await s.recallMessage(_msg[0])
    }

    return pay
}

/** 图转autman云一分钟图床
 * @description qq,wx,fs 可发 local url
 * @description /^(qb)|(tb)|(ds)|(kk)|(dd)|(ss)$/i 需转链
 * @param {string} filePath 图片路径、URL、BASE64数据、文件流数据
 * @param {string} username autman 云账号
 * @param {string} password autman 云密码
 * @returns 
 */
async function img2aut(filePath) {
    const fileData = await file2stream(filePath)
    if (fileData.success == false) return rebug(`【 img2aut 】 读取文件失败`, false, 0, null)

    const username = await s.bucketGet("cloud", "username")
    const password = await s.bucketGet("cloud", "password")
    if (!(username && password)) return rebug(`【 img2aut 】 获取 autman 账号失败`, false, 0, null)

    const data = new FormData();
    data.append('imgfile', fileData.data);
    data.append('username', username);
    data.append('password', password);

    return await axios({
        method: 'post',
        url: 'http://aut.zhelee.cn/imgUpload',
        headers: {
            // 'Authorization': 'Bearer 0cb972b0-516c-8c7a-8c95-955263eed4c1',
            'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
            ...data.getHeaders()
        },
        data: data
    }).then(function (response) {
        return rebug(
            `【 img2aut 】 ${response.data.msg}`,
            response.data.code == 200,
            response.data.code,
            response.data.code == 200 ? response.data.result.path : response.data
        )
    }).catch(function (error) {
        return rebug(`【 img2aut 】 ${JSON.stringify(error)}`, false, 0, error)
    })
}

/** 文件转文件流
 * @description 
 * @param {*} file URL、本地路径、BASE64、文件流
 * @returns 
 */
async function file2stream(file) {
    let imageStream;

    // 检查图片类型
    if (isURL(encodeURI(file))) {
        // 网络文件
        const response = await axios.get(encodeURI(file), { responseType: 'stream' });
        imageStream = response.data;
        return rebug(
            `【 file2stream 】 网络文件: ${response.code || response.status}} - ${response.message || response.status || ""}`,
            true,
            response.code || response.status,
            imageStream || response
        )
    } else if (fs.existsSync(encodeURI(file))) {
        // 本地文件
        // imageStream = fs.createReadStream(file);
        return await fs.promises.readFile(encodeURI(file), 'utf8')
            .then(d => rebug(`【 file2stream 】 本地文件 - 读取文件成功`, true, 1, d))
            .catch(e => rebug(`【 file2stream 】 本地文件:${e.name}[${e.code}] - ${e.message}`))
    } else if (isBase64(file)) {
        // BASE64文件
        const buffer = Buffer.from(file, 'base64');
        // imageStream = fs.createReadStream(buffer);
        return await fs.promises.readFile(buffer, 'utf8')
            .then(d => rebug(`【 file2stream 】 BASE64文件 - 读取文件成功`, true, 1, d))
            .catch(e => rebug(`【 file2stream 】 BASE64文件:${e.name}[${e.code}] - ${e.message}`))
    } else if (file instanceof stream.Readable) {
        // 文件流
        imageStream = file;
        return rebug(`【 file2stream 】 文件流`, true, 1, imageStream)
    } else {
        // 其他类型
        // throw new Error('Unsupported image source type');
        return rebug(`【 file2stream 】 Unsupported image source type`, false, 0, file)
    }
}

/** 文件转URL（本地） */
async function file2local(file) { }

/** 判断 字符串 是否为 URL 格式
 * @description 
 * @param {*} str 
 * @returns 
 */
function isURL(str) {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
}

/** 判断 字符串 是否为 Base64 格式
 * @description 
 * @param {*} str 
 * @returns 
 */
function isBase64(str) {
    try {
        return Buffer.from(str, 'base64').toString('base64') === str;
    } catch (_) {
        return false;
    }
}

/** 多平台发文件
 * @description 
 * @param {*} file 
 * @param {*} file_name 
 * @returns 
 */
async function sendFile(file, file_name = "") {
    const im = await s.getImtype()
    let fileName
    if (file_name) fileName = file_name
    else {
        fileName = /(?<=[\/\\]?)[^\/\\]+?\.\w+$/.exec(file)
        fileName = fileName ? fileName[0] : "未知文件 by jusapi"
    }

    rebug(`【 sendFile 】${im} - 发送文件: ${fileName}`, 1)
    if (/^qq$/i.test(im)) return await s.reply(`[CQ:file,file=${file}]`).then(r => rebug(`【 sendFile 】${im} 发送完成`, true, 200, r[0]))
    if (/^wx$/i.test(im)) return await xyo_sendFile(file, fileName)

    const fileStream = await file2stream(file); if (fileStream.success == false) return rebug(`【 sendFile 】${im} - 读取文件失败`)

    if (/^tb$/i.test(im)) return await tb_sendFile(fileStream.data, fileName)
    else if (/^dc$/i.test(im)) return await dc_sendFile(fileStream.data, fileName)
    else if (/^sk$/i.test(im)) return await sk_sendFile(fileStream.data, fileName)
    else if (/^kk$/i.test(im)) return await kk_sendFile(fileStream.data, fileName)
    else return await s.reply(`[CQ:file,file=${file}]`)
}

/** WX XYO POST发文件
 * @description 
 * @param {*} file 文件，路径/URL/BASE64/文件流
 * @param {*} fileName 文件名
 * @param {*} channelId 发送目标
 * @param {*} xyo_host 
 * @param {*} xyo_token 
 * @param {*} xyo_robot_wxid 
 * @returns 
 */
async function xyo_sendFile(file, fileName, channelId = "", xyo_host = "", xyo_token = "", xyo_robot_wxid = "") {
    const win_path = await file2win(file, fileName)
    const im = await s.getImtype()
    if (!win_path.success) return rebug(`【 xyo_sendFile 】${im} - 上传文件失败`)

    const vlw_addr = xyo_host || await middleware.bucketGet("wx", "vlw_addr")
    const vlw_token = xyo_token || await middleware.bucketGet("wx", "vlw_token")
    const robot_wxid = xyo_robot_wxid || await middleware.bucketGet("wx", "robot_wxid")
    if (!(robot_wxid && vlw_addr && vlw_token)) return rebug(`【 xyo_sendFile 】${im} - 未获取到 vlw 配置`)

    const group_id = await s.getChatID()
    const to_wxid = channelId || group_id ? group_id + "@chatroom" : await s.getUserID()

    return await axios({
        url: vlw_addr,
        method: "post",
        data: {
            token: vlw_token,
            api: 'SendFileMsg',
            robot_wxid: robot_wxid,
            to_wxid: to_wxid,
            path: win_path.data
        }
    })
        .then(response => rebug(`【 xyo_sendFile 】${response.code || response.status} - ${response.message || response.statusText}`, true, response.code || response.status, response.data || response))
        .catch(error =>
            error.response ?
                error.response.data ?
                    rebug(`【 xyo_sendFile 】${error.response.data.code || error.response.data.status} - ${error.response.data.message || error.response.data.statusText}`, false, error.response.data.code || error.response.data.status, error.response.data) :
                    rebug(`【 xyo_sendFile 】${error.response.code || error.response.status} - ${error.response.message || error.response.statusText}`, false, error.response.code || error.response.status, error.response) :
                rebug(`【 xyo_sendFile 】${error.code || error.status} - ${error.message || error.statusText}`, false, error.code || error.status, error))
}

/** Kook bot POST发送文件
 * @description 
 * @param {*} fileName 
 * @param {*} fileStream 文件流
 * @param {*} channelId 会话ID，或自动获取（群号||用户号）
 * @param {*} BOT_TOKEN 缺省：系统设置 token1
 */
async function kk_sendFile(fileStream, fileName, channelId = "", BOT_TOKEN = "") {
    const cid = channelId || await s.getChatID()
    if (!cid) return rebug(`【 dc_sendFile 】未找到 channelId，目前仅支持群聊发送文件`)

    const bot_token = BOT_TOKEN || await middleware.bucketGet("kk", "token")
    if (!bot_token) return rebug(`【 kk_sendFile 】未找到 token`)

    const formData = new FormData();
    formData.append('file', fileStream, { filename: fileName });
    formData.append('target_id', cid);
    formData.append('guild_id', cid);

    const asset_create = await axios({
        url: `https://www.kookapp.cn/api/v3/asset/create`,
        method: 'post',
        headers: {
            "Content-type": "form-data",
            'Authorization': `Bot ${bot_token}`
        },
        data: formData
    })
        .then(response =>
            response.data ?
                rebug(`【 kk_asset_create 】${response.data.code + 1 ? response.data.code : null} - ${response.data.message || response.data.statusText}`, true, response.data.code || response.data.status, response.data.data || response.data) :
                rebug(`【 kk_asset_create 】${response.code || response.status} - ${response.message || response.statusText}`, true, response.code || response.status, response.data || response)
        ).catch(error =>
            error.response ?
                error.response.data ?
                    rebug(`【 kk_asset_create 】${error.response.data.code || error.response.data.status} - ${error.response.data.message || error.response.data.statusText}`, false, error.response.data.code || error.response.data.status, error.response.data) :
                    rebug(`【 kk_asset_create 】${error.response.code || error.response.status} - ${error.response.message || error.response.statusText}`, false, error.response.code || error.response.status, error.response) :
                rebug(`【 kk_asset_create 】${error.code || error.status} - ${error.message || error.statusText}`, false, error.code || error.status, error)
        )
    if (!asset_create.success || asset_create.code) return asset_create
    rebug(`【 kk_asset_create 】${asset_create.data.url}`, 1)

    return axios({
        method: 'post',
        url: `https://www.kookapp.cn/api/v3/message/create`,
        // url: `https://www.kookapp.cn/api/v3/channels/${cid}/messages`,
        headers: {
            "Content-type": "application/json",
            // 'Content-Type': 'multipart/form-data',
            'Authorization': `Bot ${bot_token}`
        },
        // data: formData
        data: {
            content: JSON.stringify(
                [
                    {
                        "type": "card",
                        "theme": "secondary",
                        "size": "lg",
                        "modules": [
                            {
                                "type": "file",
                                "title": fileName,
                                "src": asset_create.data.url,
                                "size": "?"
                            }
                        ]
                    }
                ]
            ),
            target_id: cid,
            type: 10
        }
    })
        .then(response =>
            response.data ?
                rebug(`【 kk_asset_create 】${response.data.code + 1 ? response.data.code : null} - ${response.data.message || response.data.statusText}`, true, response.data.code || response.data.status, response.data.data || response.data) :
                rebug(`【 kk_asset_create 】${response.code || response.status} - ${response.message || response.statusText}`, true, response.code || response.status, response.data || response)
        ).catch(error =>
            error.response ?
                error.response.data ?
                    rebug(`【 kk_sendFile 】${error.response.data.code || error.response.data.status} - ${error.response.data.message || error.response.data.statusText}`, false, error.response.data.code || error.response.data.status, error.response.data) :
                    rebug(`【 kk_sendFile 】${error.response.code || error.response.status} - ${error.response.message || error.response.statusText}`, false, error.response.code || error.response.status, error.response) :
                rebug(`【 kk_sendFile 】${error.code || error.status} - ${error.message || error.statusText}`, false, error.code || error.status, error)
        )
}

/** Slack bot POST发送文件
 * @description 
 * @param {*} fileName 
 * @param {*} fileStream 文件流
 * @param {*} channelId 会话ID，或自动获取（群号||用户号）
 * @param {*} BOT_TOKEN 缺省：系统设置 token1
 */
async function sk_sendFile(fileStream, fileName, channelId = "", BOT_TOKEN = "") {
    const cid = channelId || await s.getChatID() || await s.getUserID()

    const bot_token = BOT_TOKEN || await middleware.bucketGet("sk", "SLACK_BOT_TOKEN")
    if (!bot_token) return rebug(`【 sk_sendFile 】未找到 SLACK_BOT_TOKEN`)

    const formData = new FormData();
    formData.append('file', fileStream, { filename: fileName });
    formData.append('channels', cid);

    return axios({
        method: 'post',
        url: 'https://slack.com/api/files.upload',
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${bot_token}`
        },
        data: formData
    })
        .then(response => rebug(`【 sk_sendFile 】${response.code || response.status} - ${response.message || response.statusText}`, true, response.code || response.status, response.data || response))
        .catch(error =>
            error.response ?
                error.response.data ?
                    rebug(`【 sk_sendFile 】${error.response.data.code || error.response.data.status} - ${error.response.data.message || error.response.data.statusText}`, false, error.response.data.code || error.response.data.status, error.response.data) :
                    rebug(`【 sk_sendFile 】${error.response.code || error.response.status} - ${error.response.message || error.response.statusText}`, false, error.response.code || error.response.status, error.response) :
                rebug(`【 sk_sendFile 】${error.code || error.status} - ${error.message || error.statusText}`, false, error.code || error.status, error))
}

/** Discord bot POST发送文件
 * @description 
 * @param {*} fileName 
 * @param {*} fileStream 
 * @param {*} channelId 会话ID，或自动获取（目前仅支持群号）
 * @param {*} BOT_TOKEN 缺省：系统设置 token1
 */
async function dc_sendFile(fileStream, fileName, channelId = "", BOT_TOKEN = "") {
    const cid = channelId || await s.getChatID()
    if (!cid) return rebug(`【 dc_sendFile 】未找到 channelId，目前仅支持群聊发送文件`)
    // const cid = channelId || await s.getChatID() || await s.getUserID()

    const bot_token = BOT_TOKEN || await middleware.bucketGet("dc", "token")
    if (!bot_token) return rebug(`【 dc_sendFile 】未找到 token`)

    const formData = new FormData();
    formData.append('file', fileStream, { filename: fileName });
    return await axios({
        "url": `https://discord.com/api/v9/channels/${cid}/messages`,
        "method": "post",
        "headers": {
            'Content-Type': ` multipart/form-data; boundary=${formData.getBoundary()}`,
            'Authorization': `Bot ${bot_token}`
        },
        "data": formData
    })
        .then(response => rebug(`【 dc_sendFile 】${response.code || response.status} - ${response.message || response.statusText}`, true, response.code || response.status, response.data || response))
        .catch(error =>
            error.response ?
                error.response.data ?
                    rebug(`【 dc_sendFile 】${error.response.data.code || error.response.data.status} - ${error.response.data.message || error.response.data.statusText}`, false, error.response.data.code || error.response.data.status, error.response.data) :
                    rebug(`【 dc_sendFile 】${error.response.code || error.response.status} - ${error.response.message || error.response.statusText}`, false, error.response.code || error.response.status, error.response) :
                rebug(`【 dc_sendFile 】${error.code || error.status} - ${error.message || error.statusText}`, false, error.code || error.status, error))
}

/** Telegram bot POST发送文件
 * @description 
 * @param {*} chatId 
 * @param {*} fileStream 
 * @param {*} fileName 
 * @param {*} token 
 */
async function tb_sendFile(fileStream, fileName, channelId = "", BOT_TOKEN = "") {
    const cid = channelId || await s.getChatID() || await s.getUserID()

    const bot_token = BOT_TOKEN || await middleware.bucketGet("tb", "token")
    if (!bot_token) return rebug(`【 tb_sendFile 】未找到 token`)

    const form = new FormData();
    form.append('document', fileStream, { filename: fileName });

    return await axios.post(`https://api.telegram.org/bot${bot_token}/sendDocument`, form, {
        headers: {
            ...form.getHeaders(),
        },
        params: {
            chat_id: cid,
        },
    })
        .then(response => rebug(`【 tb_sendFile 】${response.code || response.status} - ${response.message || response.statusText}`, true, response.code || response.status, response.data || response))
        .catch(error =>
            error.response ?
                error.response.data ?
                    rebug(`【 tb_sendFile 】${error.response.data.code || error.response.data.status} - ${error.response.data.message || error.response.data.statusText}`, false, error.response.data.code || error.response.data.status, error.response.data) :
                    rebug(`【 tb_sendFile 】${error.response.code || error.response.status} - ${error.response.message || error.response.statusText}`, false, error.response.code || error.response.status, error.response) :
                rebug(`【 tb_sendFile 】${error.code || error.status} - ${error.message || error.statusText}`, false, error.code || error.status, error))
}

/** 文件上传windows
 * @description 需在配参设置 jusapi - win_server 文件接收服务地址
 * @param {path/url/base64/byte} file 文件
 * @param {string} filename 文件名
 * @returns 
 */
async function file2win(file, filename) {
    const host = await middleware.bucketGet("jusapi", "win_server"); if (!host) return rebug(`【 file2win 】 获取win_server_host失败`)
    const data = await file2stream(file); if (data.success == false) return rebug(`【 file2win 】 读取文件失败`)

    return await axios({
        method: 'post',
        url: host + "/upload",
        headers: {
            'Content-Type': 'application/octet-stream',
            'x-file-name': encodeURI(filename)
        },
        data: data.data
    })
        .then(function (response) {
            // console.log(JSON.stringify(response.data));
            return rebug(`【 file2win 】 ${response.code || response.status} - ${response.message || response.statusText}: ${response.data}`, true, response.code || response.status, response.data)
        })
        .catch(function (error) {
            // console.log(error);
            return rebug(`【 file2win 】 ${error.code || error.status} - ${error.message || error.statusText}`)
        });
}

/** 文件下载windows
 * @description 需在配参设置 jusapi - win_server 文件接收服务地址
 * @param {string} localpath windows文件路径
 * @returns 
 */
async function file1win(localpath) {
    const host = await middleware.bucketGet("jusapi", "win_server"); if (!host) return rebug(`【 file1win 】 获取win_server_host失败`)
    const data = await file2stream(file); if (data.success == false) return rebug(`【 file2win 】 读取文件失败`)
    return console.error("功能未开放")
    return await axios({
        method: 'post',
        url: host,
        headers: {
            'Content-Type': 'application/octet-stream',
            'x-file-name': encodeURI(filename)
        },
        data: data.data
    })
        .then(function (response) {
            // console.log(JSON.stringify(response.data));
            return rebug(`【 file2win 】 ${response.code || response.status} - ${response.message || response.statusText}: ${response.data}`, true, response.code || response.status, response.data)
        })
        .catch(function (error) {
            // console.log(error);
            return rebug(`【 file2win 】 ${error.code || error.status} - ${error.message || error.statusText}`)
        });
}

module.exports = {
    version: "1.3.4", // jusapi 版本
    isDebug: false, // 是否开启调试输出，boolean
    inputTime: 120, // 等待输入时间，秒
    payTime: 60, // 等待支付时间，秒
    recallTime: 120, // 撤回消息时间，秒
    sleep: sleep,
    rebug: rebug,
    resend: resend,
    inputReg: inputReg,
    waitPay: waitPay,
    img2aut: img2aut,
    file1win: file1win,
    file2stream: file2stream,
    sendFile: sendFile,
    encodeQR: encodeQR,
    sendNotify: sendNotify,
    getQLS: getQLS,
    AutAPI: AutAPI,
    QingLong: QingLong,
    DDDDOCR: DDDDOCR,
    WxPusher: WxPusher
}

!(async () => {
    module.exports.isDebug = /^true$/i.test(await middleware.bucketGet("jusapi", "isDebug")); if (module.exports.isDebug) rebug("【jusapi】 已开启调试功能", true)
    module.exports.appreciate = await middleware.bucketGet("jusapi", "appreciate")
    module.exports.dis_updata = /^true$/i.test(await middleware.bucketGet("jusapi", "dis_updata")); if (module.exports.dis_updata) return rebug("【jusapi】 已禁用自动更新", true)

    /*************** 自动更新 ***************/
    const is_admin = await s.isAdmin() // 是否管理员
    const group_id = await s.getChatID() // 是否群聊
    module.exports.dis_updata || is_admin && !group_id &&
        axios.get("https://raw.githubusercontent.com/iCouldFly/autman_plugins/scripts/jusapi.js")
            .then(({ status, statusText, headers, config, request, data }) => {
                // console.log("jusapi 版本检测:", { status, statusText })
                const _v = data.match(/(?<=\/\/\s*\[version\:\s*)[\d\.]+/g),
                    _d = data.match(/(?<=\/\/\s*\[version\:\s*[\d\.]+\s+).*(?=\].*)/g)?.[0]
                if (!_v) return console.log("jusapi 版本号获取失败")

                // console.log("本地:", jusapi.version, "远程:", _v[0])
                if (+ _v[0].split(".").join("") > module.exports.version.split(".").join("")) {
                    console.log("jusapi 发现新版本，尝试更新，版本:", _v[0])

                    const file_path = path.join(path.resolve(__dirname), "jusapi.js")
                    fs.writeFile(file_path, data, (err) => err ? console.error("jusapi 更新失败:", err) : (s.reply(`jusapi 已更新至: ${_v[0]}${_d ? "\n》" + _d : ""}`), console.log("保存路径:", file_path.toString())))
                }
            })
            .catch(({ port, address, syscall, code, errno, message, stack, name, config, request }) =>
                console.error("jusapi 检查更新失败:", message)
            )
})()
