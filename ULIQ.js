//[title: ULIQ]
//[language: nodejs]
//[class: 查询类]
//[author: jusbe] 售后联系方式
//[service: jusbe] 售后联系方式
//[disable: false] 禁用开关，true表示禁用，false表示可用
//[admin: false] 是否为管理员指令
//[rule: raw ^(E)(\d{4,6})$] 匹配规则，多个规则时向下依次写多个
//[rule: raw ^(UL)(\d{4,6})$] 匹配规则，多个规则时向下依次写多个
//[priority: 0] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: false]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.0]版本号
//[public: false] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: 命令》<br>说明》<br>依赖》<br><br>首发》241120<br>] 使用方法尽量写具体
// [param: {"required":false,"key":"uliq.use_tmp","bool":true,"placeholder":"","name":"保存到本地","desc":""}]

// const axios = require('axios');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio')
const path = require('path');
const fs = require('fs').promises

const middleware = require('./middleware.js');
const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID)

!(async () => {
    const templ = `<html>

    <head>
        <link rel="stylesheet" type="text/css" href="/admin/css/bootstrap.min.css">
        <link rel="stylesheet" type="text/css" href="/admin/css/style.min.css">
        <style>
            /*--预设--*/
            body {
                padding: 0px;
                margin: 0px;
            }
    
            #lyrow textarea {
                font-size: 12px;
                font-family: 'Microsoft YaHei', '微软雅黑', MicrosoftJhengHei, '华文细黑', STHeiti, MingLiu;
            }
    
            /*--编辑--*/
            #lyrow .logo {
                width: 100%;
                margin: auto auto 0 auto;
            }
    
            #lyrow .main {
                padding: 2% 2% 0 2%;
                background-color: rgba(240, 240, 244, 1);
            }
        </style>
    </head>
    
    <body>
        <div id="lyrow">
            <img class="logo" src="https://www.ouce.cn/upload/images/202104231453027251.jpg">
            <div class="main" id="plugins">
                <h1>GUANGDONG DONGJU WIRE &amp; CABLE CO LTD (E189674)</h1>
                <span>2 and 3 F, No.18 Ludipu Industrial Zone, Aigang, Huaide Community, Humen Town, Dongguan Guangdong
                    523026 CN</span>
                <hr>
                <li>
                    <h1>标题1</h1>
                    <h1>标题2</h1>
                </li>
            </div>
        </div>
    </body>
    
    </html>`


    const base64 = await middleware.render(templ, "div.main", {})
    console.log(base64)
    s.reply("[CQ:image,file=base64://" + base64 + "]")
})()