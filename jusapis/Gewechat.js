/**
 * @class Gewechat
 * @version 2.0.0
 * @author jusbe <https://github.com/iCouldFly>
 * @description 需保持autman内部端口为8080
 * @history
 * - v1.0.0 2025-01-01 初版
 * - v2.0.0 2025-02-19 增加Redis缓存策略
 */

var _0xodO='jsjiami.com.v7';const _0x307072=_0x4cc7;(function(_0x1e2fb3,_0x321e53,_0x2d0d41,_0x5c16fc,_0x44551d,_0x30b14b,_0x33132e){return _0x1e2fb3=_0x1e2fb3>>0x1,_0x30b14b='hs',_0x33132e='hs',function(_0x55cc4f,_0x5cfddc,_0x538dba,_0x4593bd,_0x337197){const _0x4d6530=_0x4cc7;_0x4593bd='tfi',_0x30b14b=_0x4593bd+_0x30b14b,_0x337197='up',_0x33132e+=_0x337197,_0x30b14b=_0x538dba(_0x30b14b),_0x33132e=_0x538dba(_0x33132e),_0x538dba=0x0;const _0x2ce156=_0x55cc4f();while(!![]&&--_0x5c16fc+_0x5cfddc){try{_0x4593bd=-parseInt(_0x4d6530(0x17e,'scKE'))/0x1*(parseInt(_0x4d6530(0x209,'DP%j'))/0x2)+-parseInt(_0x4d6530(0x20f,'RH0N'))/0x3+parseInt(_0x4d6530(0x1f4,'gvzC'))/0x4*(parseInt(_0x4d6530(0x1fa,']2#t'))/0x5)+-parseInt(_0x4d6530(0x1f3,'B^NF'))/0x6+parseInt(_0x4d6530(0x199,'3xR*'))/0x7*(parseInt(_0x4d6530(0x15a,'@SOI'))/0x8)+parseInt(_0x4d6530(0x1b1,'3xR*'))/0x9+parseInt(_0x4d6530(0x15e,'#Wrh'))/0xa;}catch(_0x3767e3){_0x4593bd=_0x538dba;}finally{_0x337197=_0x2ce156[_0x30b14b]();if(_0x1e2fb3<=_0x5c16fc)_0x538dba?_0x44551d?_0x4593bd=_0x337197:_0x44551d=_0x337197:_0x538dba=_0x337197;else{if(_0x538dba==_0x44551d['replace'](/[XBkwGDYnEOUANRfuqg=]/g,'')){if(_0x4593bd===_0x5cfddc){_0x2ce156['un'+_0x30b14b](_0x337197);break;}_0x2ce156[_0x33132e](_0x337197);}}}}}(_0x2d0d41,_0x321e53,function(_0x788716,_0x1f5999,_0x21b9ae,_0x44b7a5,_0x458b15,_0x1f0cb4,_0x522f99){return _0x1f5999='\x73\x70\x6c\x69\x74',_0x788716=arguments[0x0],_0x788716=_0x788716[_0x1f5999](''),_0x21b9ae='\x72\x65\x76\x65\x72\x73\x65',_0x788716=_0x788716[_0x21b9ae]('\x76'),_0x44b7a5='\x6a\x6f\x69\x6e',(0x19810c,_0x788716[_0x44b7a5](''));});}(0x190,0xc43ec,_0x4d19,0xca),_0x4d19)&&(_0xodO=0x15a9);const axios=require('axios'),redis=require(_0x307072(0x1a6,'#Wrh'));module[_0x307072(0x1e2,'A$Cx')]=class Gewechat{constructor(_0x3f4efe,_0x321da7,_0x277aad,_0x40300a=_0x307072(0x1f2,'&9tn')){const _0xf3461d=_0x307072,_0x2406b1={'rJBCm':_0xf3461d(0x1b8,'ieDz'),'lenks':_0xf3461d(0x16a,'x0$6'),'GHPBK':_0xf3461d(0x18a,'K(T)'),'mSCLH':_0xf3461d(0x19c,'RH0N'),'NRVgH':'13|9|16|17|14|10|4|12|5|15|3|7|8|2|18|11|1|0|6','xPoVl':_0xf3461d(0x15b,'rF53'),'WmZlV':function(_0x17828b,_0x501631){return _0x17828b===_0x501631;},'xfrkL':'acnsf','seTOM':function(_0x2d7c89,_0xb998ee){return _0x2d7c89!==_0xb998ee;},'FbRFy':_0xf3461d(0x184,'W^kv'),'ExCxr':'【Gewechat】【redis】获取数据失败:','DSEbq':'error','pDjTS':_0xf3461d(0x148,'IzNx')},_0x398279=0x1c20,_0x267a5b=redis[_0xf3461d(0x206,'W^kv')]({'url':_0x40300a});_0x267a5b['on'](_0x2406b1['DSEbq'],_0x151eb1=>console[_0xf3461d(0x1ec,'a&FR')](_0xf3461d(0x14a,'RH0N'),_0x151eb1)),_0x267a5b[_0xf3461d(0x193,'GtV]')]();const _0x5b6c28=axios[_0xf3461d(0x161,'3xR*')]({'baseURL':_0x3f4efe+_0xf3461d(0x1eb,'scKE'),'headers':{'X-GEWE-TOKEN':_0x321da7,'Content-Type':_0x2406b1[_0xf3461d(0x1ab,'scKE')]}}),_0x3eb433=(_0x6b792c,_0x3f601b=void 0x0)=>_0x5b6c28[_0xf3461d(0x1b2,'UAvw')](_0x6b792c,{...{'appId':_0x277aad},..._0x3f601b})['then'](_0x4683ab=>console[_0xf3461d(0x160,'zk38')]('【Gewechat】【'+_0x6b792c+'】',JSON['stringify'](_0x3f601b),_0xf3461d(0x1f9,'IzNx'),JSON[_0xf3461d(0x208,'bTcz')](_0x4683ab?.[_0xf3461d(0x1f0,'B^NF')]))||_0x4683ab?.[_0xf3461d(0x175,'K(T)')])[_0xf3461d(0x1b9,'SPqq')](({message:_0x18fda0,name:_0x1e4bc5,code:_0x2fd7b8,config:_0x5ec069,request:_0x1f9d1f})=>console[_0xf3461d(0x1ce,'RH0N')](_0xf3461d(0x1b0,'SPqq')+_0x6b792c+'】',_0x1e4bc5,_0x2fd7b8,_0x18fda0)||{});this[_0xf3461d(0x1b5,'5i[[')]=(_0x317823,_0x124519=0x2)=>_0x3eb433(_0xf3461d(0x18f,'zk38'),{'xml':_0x317823,'type':_0x124519}),this[_0xf3461d(0x166,'gvzC')]=class _0x59851b{constructor(_0x26658f=''){const _0x6901e1=_0xf3461d,_0x572c93={'YKtst':_0x2406b1[_0x6901e1(0x185,'DP%j')]};if(_0x2406b1[_0x6901e1(0x15d,'PQ1S')]!==_0x2406b1[_0x6901e1(0x207,'1iz!')]){this[_0x6901e1(0x19d,'(]$R')]=_0x26658f;const _0x59a88c=(_0x13f25d,_0x1cd71b,_0x5c6318)=>_0x5b6c28[_0x6901e1(0x1ae,'$iym')](_0x13f25d,{...{'appId':_0x277aad,'toWxid':_0x26658f},..._0x1cd71b},{'timeout':0xaf0})[_0x6901e1(0x16c,'#Cy#')](_0x2b9bb5=>{const _0x53ed85=_0x6901e1,{createTime:createTime=0x0,msgId:msgId=0x0,newMsgId:newMsgId=0x0}=_0x2b9bb5[_0x53ed85(0x17b,'@SOI')];if(_0x5c6318)_0x267a5b[_0x53ed85(0x1ed,'UAvw')](_0x53ed85(0x1d2,'&&Gz')+msgId+'_'+newMsgId+'_'+createTime,_0x398279,_0x5c6318);return console[_0x53ed85(0x157,'L3#@')](_0x53ed85(0x194,'#Wrh')+_0x13f25d+'】',JSON[_0x53ed85(0x213,'#Cy#')](_0x1cd71b),_0x2406b1[_0x53ed85(0x18c,'RH0N')],JSON['stringify'](_0x2b9bb5?.[_0x53ed85(0x203,'W^kv')])),_0x2b9bb5?.[_0x53ed85(0x175,'K(T)')];})[_0x6901e1(0x1c4,'x0$6')](({message:_0x2a893d,name:_0x843072,code:_0x3fdba9,config:_0x2a9279,request:_0x1b0143})=>console['error']('【Gewechat】【'+_0x13f25d+'】',_0x843072,_0x3fdba9,_0x2a893d)||{});this[_0x6901e1(0x16b,']2#t')]=(_0x3b8a3e,_0x58f3c1=null)=>_0x59a88c(_0x6901e1(0x1e0,'D^D&'),{'content':_0x3b8a3e,'ats':_0x58f3c1},_0x3b8a3e),this[_0x6901e1(0x1e4,'D^D&')]=(_0x2a6dde,_0x541067)=>_0x59a88c(_0x6901e1(0x1a1,'a&FR'),{'fileUrl':_0x2a6dde,'fileName':_0x541067},_0x6901e1(0x167,'ieDz')),this[_0x6901e1(0x170,'L6lg')]=_0x5492b7=>_0x59a88c('/message/postImage',{'imgUrl':_0x5492b7},_0x6901e1(0x1c5,'RH0N')),this[_0x6901e1(0x1d8,'TO6B')]=(_0x4654f9,_0x4c2620)=>_0x59a88c(_0x6901e1(0x1e9,'(]$R'),{'voiceUrl':_0x4654f9,'voiceDuration':_0x4c2620},_0x6901e1(0x1a7,'(]$R')),this[_0x6901e1(0x144,'@SOI')]=(_0x153c17,_0x2c1f07,_0xf622b5)=>_0x59a88c(_0x6901e1(0x151,'5i[['),{'videoUrl':_0x153c17,'thumbUrl':_0x2c1f07,'videoDuration':_0xf622b5},_0x6901e1(0x1b7,'5^Io')),this['postLink']=(_0x32d53f,_0x587904,_0x259433,_0x3df7c6)=>_0x59a88c(_0x6901e1(0x1ad,'&9tn'),{'title':_0x32d53f,'desc':_0x587904,'linkUrl':_0x259433,'thumbUrl':_0x3df7c6},_0x6901e1(0x1d6,']2#t')),this[_0x6901e1(0x16e,'PQ1S')]=(_0x2cbf17,_0x4995c6)=>_0x59a88c(_0x6901e1(0x1d7,'DP%j'),{'nickName':_0x2cbf17,'nameCardWxid':_0x4995c6},_0x6901e1(0x1db,'hvxz')),this[_0x6901e1(0x1bb,']2#t')]=(_0x409244,_0x1e3e93)=>_0x59a88c(_0x6901e1(0x198,'L6lg'),{'emojiMd5':_0x409244,'emojiSize':_0x1e3e93},_0x6901e1(0x179,'hvxz')),this[_0x6901e1(0x165,'$fR2')]=_0x5537f8=>_0x59a88c(_0x6901e1(0x20c,'bTcz'),{'appmsg':_0x5537f8},_0x6901e1(0x1a8,'PQ1S')),this[_0x6901e1(0x152,'5i[[')]=(_0x38cbd3,_0x5d2aa4,_0x1395ea,_0x30b0d8,_0x1609dc,_0x32b9ea)=>_0x59a88c(_0x6901e1(0x1da,'VpEq'),{'miniAppId':_0x38cbd3,'displayName':_0x5d2aa4,'pagePath':_0x1395ea,'coverImgUrl':_0x30b0d8,'title':_0x1609dc,'userName':_0x32b9ea},'[小程序]'),this['forwardFile']=_0x188324=>_0x59a88c(_0x6901e1(0x18b,']2#t'),{'xml':_0x188324},_0x6901e1(0x1dd,'D^D&')),this[_0x6901e1(0x15f,'A$Cx')]=_0xba14b4=>_0x59a88c(_0x6901e1(0x1cd,'PQ1S'),{'xml':_0xba14b4},_0x6901e1(0x150,'rF53')),this[_0x6901e1(0x147,'VpEq')]=_0x3ff763=>_0x59a88c(_0x6901e1(0x1c1,']L3)'),{'xml':_0x3ff763},_0x6901e1(0x14b,'QUBk')),this['forwardUrl']=_0x30b78d=>_0x59a88c(_0x6901e1(0x1bf,']2#t'),{'xml':_0x30b78d},_0x6901e1(0x18d,'&&Gz')),this[_0x6901e1(0x1be,'QUBk')]=(_0x5a5388,_0x2c5c76)=>_0x59a88c('/message/forwardMiniApp',{'xml':_0x5a5388,'coverImgUrl':_0x2c5c76},_0x6901e1(0x1b3,'rC@#')),this[_0x6901e1(0x180,'L3#@')]=(_0x2b06db,_0x5324fd,_0x56d432)=>_0x59a88c('/message/revokeMsg',{'msgId':_0x2b06db,'newMsgId':_0x5324fd,'createTime':_0x56d432});}else _0x450285[_0x6901e1(0x17c,'L6lg')](_0x572c93[_0x6901e1(0x204,'IzNx')],_0x3b4c89);}},this['contactsModule']=class _0x2398af{static ['fetchContactsList']=async(_0x46b2db=![])=>_0x3a7ed0(_0xf3461d(0x1b4,'sW5!')+contactsInfo,_0x46b2db,()=>_0x3eb433(_0xf3461d(0x1fb,'j!Nb')));static [_0xf3461d(0x1c8,'DP%j')]=()=>_0x3eb433(_0xf3461d(0x18e,'$iym'));static [_0xf3461d(0x158,'sW5!')]=async(_0x3883b5,_0x7ef6e8=![])=>_0x3a7ed0('gw:search:'+_0x3883b5,_0x7ef6e8,()=>_0x3eb433('/contacts/search',{'contactsInfo':_0x3883b5}));static [_0xf3461d(0x156,'5i[[')]=(_0x52e0fd,_0x5325f9,_0x10270a,_0x516725,_0x6d2212)=>_0x3eb433(_0xf3461d(0x1bd,'rF53'),{'scene':_0x52e0fd,'option':_0x5325f9,'v3':_0x10270a,'v4':_0x516725,'content':_0x6d2212});static [_0xf3461d(0x171,'gvzC')]=_0xc70537=>_0x3eb433(_0xf3461d(0x1cf,'#Wrh'),{'wxid':_0xc70537});static [_0xf3461d(0x16d,'3xR*')]=(_0x597188,_0x4daccb)=>_0x3eb433(_0xf3461d(0x177,'7yVm'),{'phones':_0x597188,'opType':_0x4daccb});static [_0xf3461d(0x14e,'x0$6')]=async(_0x3b3f71,_0x3cf83e=![])=>_0x3a7ed0(_0xf3461d(0x14f,'K(T)')+_0x3b3f71[_0xf3461d(0x16f,'#Cy#')]()[_0xf3461d(0x1e3,'K(T)')](','),_0x3cf83e,()=>_0x3eb433(_0xf3461d(0x1e6,'a&FR'),{'wxids':_0x3b3f71}));static [_0xf3461d(0x1d3,'L3#@')]=async(_0x13d183,_0x3ee4fd=![])=>_0x3a7ed0('gw:getDetailInfo:'+_0x13d183[_0xf3461d(0x191,'$fR2')]()[_0xf3461d(0x1c7,'UAvw')](','),_0x3ee4fd,()=>_0x3eb433('/contacts/getDetailInfo',{'wxids':_0x13d183}));static [_0xf3461d(0x1c2,'K(T)')]=(_0x28004c,_0x5b0e59)=>_0x3eb433(_0xf3461d(0x20a,'a&FR'),{'wxid':_0x28004c,'onlyChat':_0x5b0e59});static ['setFriendRemark']=(_0x1131fc,_0x2865ac)=>_0x3eb433(_0xf3461d(0x1d4,']L3)'),{'wxid':_0x1131fc,'remark':_0x2865ac});static [_0xf3461d(0x190,'hvxz')]=async(_0x49de3b,_0x204fdf=![])=>_0x3a7ed0(_0xf3461d(0x1df,'rF53')+_0x49de3b[_0xf3461d(0x159,'ieDz')]()['join'](','),_0x204fdf,()=>_0x3eb433(_0xf3461d(0x212,'a&FR'),{'phones':_0x49de3b}));},this['groupModule']=class _0x5b77bb{static [_0xf3461d(0x1ef,'K(T)')]=_0x41cc47=>_0x3eb433(_0xf3461d(0x1ff,'GtV]'),{'wxids':_0x41cc47});static [_0xf3461d(0x1ea,'Oazv')]=_0x2dbcb0=>_0x3eb433(_0xf3461d(0x210,'&9tn'),{'url':_0x2dbcb0});static ['joinRoomUsingQRCode']=_0x31bdad=>_0x3eb433(_0xf3461d(0x1af,'QUBk'),{'qrUrl':_0x31bdad});constructor(_0x4837f4){const _0x52ed24=_0xf3461d,_0x2a1a11=_0x2406b1[_0x52ed24(0x1d5,'&9tn')][_0x52ed24(0x168,'W^kv')]('|');let _0x188ea4=0x0;while(!![]){switch(_0x2a1a11[_0x188ea4++]){case'0':this['setMsgSilence']=_0x52682e=>_0x3eb433(_0x52ed24(0x17f,'x0$6'),{'chatroomId':_0x4837f4,'silence':_0x52682e});continue;case'1':this[_0x52ed24(0x1fe,'IzNx')]=_0x4d84f0=>_0x3eb433(_0x52ed24(0x192,'K(T)'),{'chatroomId':_0x4837f4,'top':_0x4d84f0});continue;case'2':this['getChatroomQrCode']=async(_0x35adf3=![])=>_0x3a7ed0(_0x52ed24(0x1e5,'@SOI')+_0x4837f4,_0x35adf3,()=>_0x3eb433(_0x52ed24(0x201,'wTuy'),{'chatroomId':_0x4837f4}));continue;case'3':this[_0x52ed24(0x186,'D^D&')]=async(_0x4c374a=![])=>_0x3a7ed0(_0x52ed24(0x172,'a&FR')+_0x4837f4,_0x4c374a,()=>_0x3eb433(_0x52ed24(0x20d,'hvxz'),{'chatroomId':_0x4837f4}));continue;case'4':this['disbandChatroom']=()=>_0x3eb433(_0x52ed24(0x1f7,'a&FR'),{'chatroomId':_0x4837f4});continue;case'5':this[_0x52ed24(0x162,'5^Io')]=async(_0x3abde1=![])=>_0x3a7ed0(_0x52ed24(0x1bc,'5^Io')+_0x4837f4,_0x3abde1,()=>_0x3eb433(_0x52ed24(0x1e8,'scKE'),{'chatroomId':_0x4837f4}));continue;case'6':this['roomAccessApplyCheckApprove']=(_0xffa051,_0x20b8ff)=>_0x3eb433(_0x52ed24(0x1c0,'[M)a'),{'chatroomId':_0x4837f4,'newMsgId':_0xffa051,'msgContent':_0x20b8ff});continue;case'7':this['setChatroomAnnouncement']=_0x1d9a0b=>_0x3eb433('/group/setChatroomAnnouncement',{'chatroomId':_0x4837f4,'content':_0x1d9a0b});continue;case'8':this['addGroupMemberAsFriend']=(_0x12f95d,_0x5af8fa)=>_0x3eb433(_0x52ed24(0x146,'#Cy#'),{'chatroomId':_0x4837f4,'memberWxid':_0x12f95d,'content':_0x5af8fa});continue;case'9':this[_0x52ed24(0x188,'Oazv')]=_0x329c04=>_0x3eb433('/group/modifyChatroomRemark',{'chatroomRemark':_0x329c04,'chatroomId':_0x4837f4});continue;case'10':this[_0x52ed24(0x1a3,'1iz!')]=()=>_0x3eb433('/group/quitChatroom',{'chatroomId':_0x4837f4});continue;case'11':this['adminOperate']=(_0x4c3e7a,_0xed6c34)=>_0x3eb433('/group/adminOperate',{'chatroomId':_0x4837f4,'operType':_0x4c3e7a,'wxids':_0xed6c34});continue;case'12':this[_0x52ed24(0x163,'A$Cx')]=async(_0x5b5554=![])=>_0x3a7ed0(_0x52ed24(0x1de,')sA#')+_0x4837f4,_0x5b5554,()=>_0x3eb433('/group/getChatroomInfo',{'chatroomId':_0x4837f4}));continue;case'13':this[_0x52ed24(0x1a5,'L3#@')]=_0x5e402c=>_0x3eb433('/group/modifyChatroomName',{'chatroomName':_0x5e402c,'chatroomId':_0x4837f4});continue;case'14':this[_0x52ed24(0x155,'rF53')]=_0x51634=>_0x3eb433(_0x52ed24(0x19f,'K(T)'),{'wxids':_0x51634,'chatroomId':_0x4837f4});continue;case'15':this['getChatroomMemberDetail']=async(_0x43eaf2,_0x74fe0b=![])=>_0x3a7ed0(_0x52ed24(0x182,'DP%j')+_0x4837f4+':'+_0x43eaf2[_0x52ed24(0x19b,'x0$6')]()['join'](','),_0x74fe0b,()=>_0x3eb433(_0x52ed24(0x211,'5^Io'),{'chatroomId':_0x4837f4,'memberWxids':_0x43eaf2}));continue;case'16':this['modifyChatroomNickNameForSelf']=_0x7eb15=>_0x3eb433(_0x52ed24(0x14d,'rF53'),{'nickName':_0x7eb15,'chatroomId':_0x4837f4});continue;case'17':this['inviteMember']=(_0x1fdad8,_0x505fc0)=>_0x3eb433(_0x52ed24(0x164,'#Wrh'),{'wxids':_0x1fdad8,'chatroomId':_0x4837f4,'reason':_0x505fc0});continue;case'18':this[_0x52ed24(0x19a,'D^D&')]=_0x1daa0d=>_0x3eb433('/group/saveContractList',{'chatroomId':_0x4837f4,'operType':_0x1daa0d});continue;}break;}}};const _0x3a7ed0=async(_0x19ad61,_0x9ae0c,_0x2fcbfc)=>{const _0x32aecc=_0xf3461d;if(_0x2406b1['WmZlV'](_0x32aecc(0x1d9,'wTuy'),_0x2406b1[_0x32aecc(0x183,'IzNx')])){if(!_0x9ae0c){if(_0x2406b1['seTOM']('UZNOV',_0x2406b1[_0x32aecc(0x1ac,'UAvw')]))try{const _0x2d3dee=await _0x267a5b[_0x32aecc(0x189,'j!Nb')](_0x19ad61);if(_0x2d3dee)return console[_0x32aecc(0x1d1,'x0$6')](_0x32aecc(0x154,'RH0N')+_0x19ad61),JSON['parse'](_0x2d3dee);}catch(_0x47d0d4){console[_0x32aecc(0x1f8,'scKE')](_0x32aecc(0x1c3,'QUBk'),_0x47d0d4);}else{const _0x3072a9=_0x2406b1[_0x32aecc(0x1f6,'D^D&')][_0x32aecc(0x1ca,'VpEq')]('|');let _0x280e62=0x0;while(!![]){switch(_0x3072a9[_0x280e62++]){case'0':this[_0x32aecc(0x202,'TO6B')]=async(_0x23330a,_0x51c3b7=![])=>_0x206410(_0x32aecc(0x1e1,'hvxz')+_0x5bf7d2+':'+_0x23330a[_0x32aecc(0x191,'$fR2')]()[_0x32aecc(0x1e7,'D^D&')](','),_0x51c3b7,()=>_0x2a7293(_0x32aecc(0x14c,'#Cy#'),{'chatroomId':_0x21d1f9,'memberWxids':_0x23330a}));continue;case'1':this[_0x32aecc(0x173,'7yVm')]=_0x221f81=>_0x195019(_0x32aecc(0x1ee,'7yVm'),{'nickName':_0x221f81,'chatroomId':_0x25279b});continue;case'2':this[_0x32aecc(0x197,'(]$R')]=_0x304829=>_0x33f166(_0x32aecc(0x1f5,'&9tn'),{'chatroomId':_0x3ea658,'content':_0x304829});continue;case'3':this['inviteMember']=(_0x4e5cc3,_0x56710d)=>_0x3f39dc(_0x32aecc(0x20b,'D^D&'),{'wxids':_0x4e5cc3,'chatroomId':_0x2e7419,'reason':_0x56710d});continue;case'4':this['setMsgSilence']=_0xac39e8=>_0x3595e5('/group/setMsgSilence',{'chatroomId':_0x55c469,'silence':_0xac39e8});continue;case'5':this['getChatroomMemberList']=async(_0x56a95b=![])=>_0x24ff96('gw:getChatroomMemberList:'+_0x231f4c,_0x56a95b,()=>_0x141496('/group/getChatroomMemberList',{'chatroomId':_0x3cb5db}));continue;case'6':this[_0x32aecc(0x1a4,'1iz!')]=(_0x3bbc15,_0x59ecf8)=>_0x13b81e(_0x32aecc(0x17d,'3xR*'),{'chatroomId':_0x533376,'operType':_0x3bbc15,'wxids':_0x59ecf8});continue;case'7':this[_0x32aecc(0x1cc,'D^D&')]=_0x5e9e12=>_0x5e5db8(_0x32aecc(0x1ba,'7yVm'),{'wxids':_0x5e9e12,'chatroomId':_0x373cce});continue;case'8':this['disbandChatroom']=()=>_0x2e5ced(_0x32aecc(0x1cb,'K(T)'),{'chatroomId':_0x5e0aa8});continue;case'9':this[_0x32aecc(0x145,'[M)a')]=async(_0x1aa8c7=![])=>_0x36f6b1(_0x32aecc(0x174,'5i[[')+_0x138361,_0x1aa8c7,()=>_0x66768b('/group/getChatroomAnnouncement',{'chatroomId':_0x5719df}));continue;case'10':this['getChatroomQrCode']=async(_0x4cb8dc=![])=>_0x350fee(_0x32aecc(0x195,'scKE')+_0x2a6976,_0x4cb8dc,()=>_0x17dfd8(_0x32aecc(0x181,'L6lg'),{'chatroomId':_0x11fd6d}));continue;case'11':this[_0x32aecc(0x153,'GtV]')]=_0x2e21b5=>_0x1c6287(_0x32aecc(0x200,'1iz!'),{'chatroomId':_0x3ab33a,'top':_0x2e21b5});continue;case'12':this[_0x32aecc(0x176,'L6lg')]=(_0x53eeaf,_0x7bafde)=>_0x37cc24('/group/roomAccessApplyCheckApprove',{'chatroomId':_0x42f8e9,'newMsgId':_0x53eeaf,'msgContent':_0x7bafde});continue;case'13':this[_0x32aecc(0x149,'W^kv')]=async(_0x4f3883=![])=>_0x592f9a(_0x32aecc(0x1c6,'TO6B')+_0xc16fd8,_0x4f3883,()=>_0x197601('/group/getChatroomInfo',{'chatroomId':_0xd1e0ad}));continue;case'14':this['quitChatroom']=()=>_0x565a07(_0x32aecc(0x1a9,'scKE'),{'chatroomId':_0x2761ae});continue;case'15':this[_0x32aecc(0x1dc,']2#t')]=(_0x2b313b,_0x31fe18)=>_0x15c564('/group/addGroupMemberAsFriend',{'chatroomId':_0x32bcec,'memberWxid':_0x2b313b,'content':_0x31fe18});continue;case'16':this[_0x32aecc(0x1a0,'&&Gz')]=_0x4bf753=>_0x37b347(_0x32aecc(0x205,'#Wrh'),{'chatroomName':_0x4bf753,'chatroomId':_0xba211a});continue;case'17':this[_0x32aecc(0x1f1,'GtV]')]=_0x59a55d=>_0x5b8f67(_0x32aecc(0x187,'#Cy#'),{'chatroomRemark':_0x59a55d,'chatroomId':_0x3852f3});continue;case'18':this['saveContractList']=_0x2ef15d=>_0x580f89(_0x32aecc(0x169,'W^kv'),{'chatroomId':_0x2ac56f,'operType':_0x2ef15d});continue;}break;}}}try{const _0x25b1ea=await _0x2fcbfc();return await _0x267a5b[_0x32aecc(0x1d0,'sW5!')](_0x19ad61,_0x398279,JSON[_0x32aecc(0x1c9,'TO6B')](_0x25b1ea)),console[_0x32aecc(0x1fd,'SPqq')](_0x32aecc(0x1a2,'[M)a')+_0x19ad61),_0x25b1ea;}catch(_0x50b122){console[_0x32aecc(0x196,'sW5!')](_0x2406b1['ExCxr'],_0x50b122);throw _0x50b122;}}else return _0x2e3d58['log'](_0x32aecc(0x17a,'wTuy')+_0x4a7d64),_0xa272d1['parse'](_0x584c64);};return this;}};function _0x4cc7(_0x1b30d5,_0x5ee2f8){const _0x4d1946=_0x4d19();return _0x4cc7=function(_0x4cc77d,_0x495207){_0x4cc77d=_0x4cc77d-0x144;let _0x50bd75=_0x4d1946[_0x4cc77d];if(_0x4cc7['XDFKou']===undefined){var _0x38f8f3=function(_0x24c692){const _0x214100='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0x38c456='',_0x56685d='';for(let _0x4a6950=0x0,_0x13f4de,_0x5631e5,_0x3bb52b=0x0;_0x5631e5=_0x24c692['charAt'](_0x3bb52b++);~_0x5631e5&&(_0x13f4de=_0x4a6950%0x4?_0x13f4de*0x40+_0x5631e5:_0x5631e5,_0x4a6950++%0x4)?_0x38c456+=String['fromCharCode'](0xff&_0x13f4de>>(-0x2*_0x4a6950&0x6)):0x0){_0x5631e5=_0x214100['indexOf'](_0x5631e5);}for(let _0x524fb6=0x0,_0x3e889d=_0x38c456['length'];_0x524fb6<_0x3e889d;_0x524fb6++){_0x56685d+='%'+('00'+_0x38c456['charCodeAt'](_0x524fb6)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x56685d);};const _0x3c8b4e=function(_0x5e8ae1,_0xe47ab0){let _0x196f7b=[],_0x5c1a26=0x0,_0x308fc2,_0x5d482b='';_0x5e8ae1=_0x38f8f3(_0x5e8ae1);let _0x286a64;for(_0x286a64=0x0;_0x286a64<0x100;_0x286a64++){_0x196f7b[_0x286a64]=_0x286a64;}for(_0x286a64=0x0;_0x286a64<0x100;_0x286a64++){_0x5c1a26=(_0x5c1a26+_0x196f7b[_0x286a64]+_0xe47ab0['charCodeAt'](_0x286a64%_0xe47ab0['length']))%0x100,_0x308fc2=_0x196f7b[_0x286a64],_0x196f7b[_0x286a64]=_0x196f7b[_0x5c1a26],_0x196f7b[_0x5c1a26]=_0x308fc2;}_0x286a64=0x0,_0x5c1a26=0x0;for(let _0x1ae70d=0x0;_0x1ae70d<_0x5e8ae1['length'];_0x1ae70d++){_0x286a64=(_0x286a64+0x1)%0x100,_0x5c1a26=(_0x5c1a26+_0x196f7b[_0x286a64])%0x100,_0x308fc2=_0x196f7b[_0x286a64],_0x196f7b[_0x286a64]=_0x196f7b[_0x5c1a26],_0x196f7b[_0x5c1a26]=_0x308fc2,_0x5d482b+=String['fromCharCode'](_0x5e8ae1['charCodeAt'](_0x1ae70d)^_0x196f7b[(_0x196f7b[_0x286a64]+_0x196f7b[_0x5c1a26])%0x100]);}return _0x5d482b;};_0x4cc7['mvdSEj']=_0x3c8b4e,_0x1b30d5=arguments,_0x4cc7['XDFKou']=!![];}const _0x36afcf=_0x4d1946[0x0],_0x37e08a=_0x4cc77d+_0x36afcf,_0x5abbd6=_0x1b30d5[_0x37e08a];return!_0x5abbd6?(_0x4cc7['GdKlqw']===undefined&&(_0x4cc7['GdKlqw']=!![]),_0x50bd75=_0x4cc7['mvdSEj'](_0x50bd75,_0x495207),_0x1b30d5[_0x37e08a]=_0x50bd75):_0x50bd75=_0x5abbd6,_0x50bd75;},_0x4cc7(_0x1b30d5,_0x5ee2f8);}function _0x4d19(){const _0x273baf=(function(){return[_0xodO,'BjuGEsqOjRniafNqmAiD.DcUnokwumN.gYDvX7gO==','WPxcKxZdHSoy','WO3ORlxPNzaR','W7byW4TmW4a','WRNcJNLaWPDzWODIW7xcVmkRW44cvmk5W6ZdHgRcQW','qbLNW5RcVxndWOZcPmk2WPTMxGG','W6BcRwf7WRe','W5RcNmoiqvK','WO8mhsZcKSkAd8kCof/cQCoYpWqzl14','n8k6lmka','hLCGWP1Nvmo8vCkeccfuCgBcOqFdGCoLE0NcTwPqkZDz','44oyBuGxEtVcV8oHj+oaSUobIq','yfmgW6SHzuHwC8kEkmk7ohu','W6ZcKCoPCW','lEwYSUEQTUw7Omok','umogW7BcIGrCWPWXW7RdOSkTdHpcHCoEWOrtWRqbzmka','y8owWQ7dN8khW4mqW63dTLxdQ1RdGG','FhJcJqztW4iTjCkoWRmcBaW','FUILPoMJV2u','Ah3dKa','WQTlwqn0','W7LLWO8eWRJdGfnhW7NdGdNcH8kWD8oQjmk4W53dRa','jCkRAx82W7Ojf8kh','qSovvf9AW4r4DxCdW67cUmk7nmkMCSo7W5uuWQKEq8oLW6ldMa','W5FdLSkcw2dcQCoNWRRcSCkpAxyKW4yZW6KtWO/cR8o1ra','v18GWOvZvSk3CSkcdYzhB3K','ESkPF3GaW7ybgmobWQbyrCoNkCkLW619W5RdKW','W5VcK8o+WQdcTHyPWQSsWP5TW6JcQqBdOatdVfyPBmo3W7NdIY0UWQL+W4VcO8kSWQeDW7FcPG','W7hcSrWsWR9lWOJcVSoWW4FdMrJdHf0xlCkHcr7dVxa','W4FdLGjOwCoCcSoHsLNcM2xcNSkcvIfYn8oPWOa','44cHDZFcHxDhWRTEWP/JGBdJGz90EM3cPshJGQpOJlVLJ4pNVl3LRRZLPiNOTlz+','W4xdSKONWPW','W4VLMk7NI792','WQSJd8kdWR3dOmkdBWmdbGRcUvbJW4eCqxC','W7BcKCoZAq','WOhcSCkXWRVdJCoGWPiaWPHmW7ldU8kPW4DBdCoTb0b0nZ0','WR8Gr8knWRBdS8kPyrS','WQ9UvvNdKW','WPVdLarbxSofqmoRr3RcNhBcNCkpzJP6lmo1WPWpbW','aeW5WOhdUsi6W5NcSmkHWPTb','WOrTW6nZW649W6VcI8o/vmkRomoeWRhdM0TbW4H9DIq','W7xcOSokrgi','W4JcL3FdGCoFW43dOuv2W4VdNCosW7zKWP5uWPLXW5ZdTmopWQO','rmouWRJcQrK','W4RdVfK','g8o6WPK4WQjjW7VdRIxcQCoI','WOBcO8oeCmkLW7CqW6hcUmoMfwFcSW','W7hcVXypWRHlWOZcR8kSWO7dHq/dH3OximksdH7dINRcVr1MbG','W64ZlJJcQq','dUMqUUAoV1y','W4JcUCkGWQVdLSocWPOlW4nDW77dVmkUW4vte8o8b0bLoW','WRW7rSkqWO7dU8kPzaC','m2qzWRZcQG','W7nZxepdLmklWOFdSWXwWO1cnXBdNWdcTaZdIv0','BowqN+EkS8oP','nmkGFKWbW7GtdCkJWQnAvCo1oSkwW7PUW5RdLM3cUCkN','kEAwRUs6OSkZ','WQCEkuZdQmk0WRf0WOtcOK/dMHZcSInQwXL5','WP/dGSoxuNhcVmouWQBcRCooBvmKW6eUW6iuWP3cGmoOrmkotq','xuqXWP3dVcyqW5NdSSkZWPfaAXrKEeS','ugxdJSotW5FdHCkXW5j5WPBcJSoXDWOiW6aej2LMx8ohAJdcSSklW40','W5L2WRudCmoFrG','W57dNb9a','aKyNWPRdIs4BW5K','WOZcOvBcIgxdVmongvZdVhOKW6m4zmojWOJcNamhxW','WOSuD8oWWOpcVMC9lmkts8kKW4O5q8k6n8kemcZdHxa','gey9WOa','WRNcJNLaWPDzWOD0W6xcOCkCW6ulqCk/W7hdHgJcI1nnwmkaWRZcGsRcKCk9','W7NcTCogbw7dGdyWtCoJWQhdPCoRWOlcKYxcNaW','dmouW6roDCoGccPKWOHxW6VcKW'].concat((function(){return['WRNcNZKaWOnzW4e','W4efASoXWOu','W6/cM8oUqLG','W7LLWO8eWRJdGfnyW7pdIt/cL8kSECoNkmkUW4RdSCopDSk/WQVcNH/cMfXNimkSW5eSsCoOWO7cLG','W5FdGrnpx8oqlmoNt33cJhJcNmkg','W6NdTLRdVW','WP9CnSopv8oWy8kxsxLfaG3cQ8o5W44mWOSAcW','W5iehdBcKSobr8owE0dcPCoGjYaFmKe3WQ47W63dPq','WRxcPHBcRmkwo1ddJGKvW7FdRM8','F2RcPtBcGGdcGxOepmkzW7rX','WO8gcJdcLmklr8kkCLVcHCoPkJWclLPGW5LMWRtcS8oiW4JcIc1fmSk0Bq','cNK7WRJdOW','WOSqASoXWOlcRYSTnSoptSkGW5aFCSk7m8kwcY3dJhi','W7pcM3LaWPa','W5lcHcG','ymkpu30zW7i0','W4PjWQhdMSoOxCkYWRldO19FW59yzSkqCSk4gmk9W6FdGSkpW5JdMmkMnmoY','EXNdMxddNv3dQW','WQrfsG','WP/dKhHMddpdGa','W51uimojrmo5d8kCwMHwgqFcHCodW4OvWPGhdXy','W4qio8kHdx0AW6HiWOPKWQBcRxC','FwafWQdcUCoiEe0st8oqW4pdGCoujSkqW6OTW7LsW6xdSeyS','WQSXqCkNWRddTCk0Dq0ygsJcS1biW4OiAIGpBmoAyq','W57dICkrW5u','WRBdSMjwea','W4JcK2RdGmoEW5ZcRvXQWOddKmorW6ncWOjqWQTXW5RdVSomWOaWAGu','W5NdMSkaW5v/rmk0W7hcVCobWOLb','WOy8cSkcma','ptNdH1GlWPX8aSkd','W5BdOmoZWQVdP8osWQ8TWQK','WOSuD8oWWOpcVMC9lmktx8kKW4O9q8k6n8kmhrldHM3dQSkrFmk/CbW8zW','xu4MWOhdUJDyW5xcS8k1WPDhEG1KBv1Rga','ysddKeiwWPPYaCovWRmmCZtdRryWWRZcPMG','ghxcHSoBW4FdGCoDW519WPBcV8o2Erm3W6Ogke16DConAZ/cUmkcWPPnxKm','yCoRWQXzbspdRfymlYaZW6e','WQldPCkahcBdKmo4W7lcIIBdQ3Kl','WO8gcJdcLmklr8kyCf3cO8oKasCzl2DIW7DL','cSofhfDkW4auENmdW5/cV8k1lCkzEmo5W5O8WR4/smoZW6tcPSkQW6XEWOpdTG','WOSuD8oWWOpcVMC9lmkts8kKW4ORwCk8pmkhocBdH23dOSklFmkaCaaM','vSobW4b4WPLSn8kQWO4','WPVcUr/cM1BdOCoQffi','WPpcKCo4WOZcQWDYWQSsWP5TW6JcPaVdQGldOxq8CCo+W67dVa','cSosW4b+WOj7CCkTWPnAwSowWPZcNSk/khS2utXckCkkEmkeAJ8BW4a','WRPXs0FdHSkyWOtdGePcWODE','WO7dIwzjdthdLCk6WR/dTCk2C8oKW4j6Bq','W53dJCkrW7DJqmkdW6/cU8olWOP8nKBdGa','44kaWPFdNvX1WORcQmosWORJGyFJGPPNiI0Rr+obQownKEEvSoMvH+IVImkC','AUINTUMJG8kV','cSosW4b+WOj7CCkRWPjkxSomWPlcN8k9cNe2FJXDcSkCtmkYzI4uW40g','W5FdKSkFwMhcUmkRWQpcRCoeyxq5W4y0W6ytWPZcO8oUwSk0hSoDW4pcI0BdPvBcUfJcO0VdN2y6','W4hdTKOgWOBcUmo7WR58m2hcLG','W5pdHeXjtSoblCo9r2ZcMf7cNCknsMG','WQpLMyVNIQPO','kmouWRZdGSkyW40wW6ZcKeJdPu7dK8oaW4ZcKKBdPq','D8owWQRdHCkMW4uFW6ddVKJdUG','WOjApmoLwCoOva','44kaWPFdNvX1WORcQmosWORJGyFJGPPNiI0Rr+obQos5JUE9VowSHUIoKownSoAvH+AnMU++Iq','WORdKmkawMlcRCojWQVcR8ocBwa','zSoDWR3dSSkeW4ifW6JdNeZdUq','WO3cQCox','rmouWQ3cNGja','jI/cNe4','W5RdP1NdMtFcUSoxmNZdVemG','W4NcG8krbcpcTmk1WRldSCoCp25XWReGWR8BW5/dV8o9aSkgr8ocWPhcUrxdTaldI0VdOcJdHJTKWOiBW6brWRLBWOW5g8oe','W4hdGSodWOxcGHvOWQ0','W6XiW5zcW5y','W5xdHcVcM8kzWPJcTGf8WPhdNmoIW5Tj','W5PHWRCBy8ozuunZlxNcLa','h8kTW4q','mHjqWR5JnW'].concat((function(){return['qSohgNTxW5fpB3KyW7hcMSkXnmkjCSoKW7SyWQGM','W5TRWReVASokqxHXi3pcUb/cPCod','W4JcK2RdGmoEW5ZcRvHRWPldKmodW79mWO9CWR1MW4C','WQubASkeusBdVCkXus4','iZFdO3xdLL/dNgiciCk0W7Lv','dUAxH+s4MgC','W4NdMmkjW51/','WPxdJ8kxW5T+uCoyW67cTCosWOj2n07dM8ojWQpcICkdl3pdH2G','44k2W5rBm8krWRldTSk5qEobJooaL8kllWJcUfBJGRFOJOZLJiRNVAtLRkpLP4FOT5NdLa','jCkRAx8NW7iEcq','uCoDW5D/','jbbzWRb2nI8lCmk7jmk2lh1RsCorW60IhSoXba','W5TVW7v0W5m9W6hcI8ktu8k2lG','vSoAW4bL','W77cVcv0FSkDc8kHW6u','kJFdVgpdG13dV10eimkVW7e','W4maiSo5WPlcQ0CHpSoixSkUW5ewCmk9pmkndcZdGhRdQSkDyCk4iW','WRTTWPKcWQVdIt9DW73dMstcNSk6v8obimk5W5pdKmobDSkuWOtcKGBcHvHMiW','ymooW6pdLSkoW5GYW6hdNKZdUfldImo7W6tcMe3dPCoGeCkQW5WnWQpdO8kwwW','W5ddKGjp','W7ZcVdLTDSktcCkJW7pdUSkeirVcJ2OvnSkQWQZcMZhcVSk3W5vrW6ne','W7LHWPifWRNdKr9bW6/cGIpcGCk5vCoUlCkkW5ddSCooFSkWWQBcMqBcS055cCkdW40Q','WP5dWOG2WRPbjqFcKCosF8oM','BoIHUUAaSCoP','44gcqblcUmkPW5S/sWpJGkRJGOpdMCofW4q9WOZJGPtKUO7NVRVLRBJOJjhLJyNMLzlMJkFVVAC','WO/cTXJcJG','W6VcOsrVrq','FGDhWRbIiLacE8k4kmkzb2L8xSodW6Ol','WQFdNt4wW5z5W6fDW43cMSku','WONdTeWRWOhcOCkXWQTqkuRcII0/WRHjW4nvWR8s','WPpcO8ogw8kRW6y8W7VcSW','WQhcTcrVqSkarCkHW6xdVCkgoqRcL2e5mCkIWP7cGJpcOCkJW4i','WOdcO8o/WR/dGmoxWR4gWO1zW6pdOmk1W6z/g8o0jKrLgZ1nDCkyW4NdVW','WPFdN2roka','W4ldOSkDW5XY','WOVcSCkRWRpdLG','fuWGWQ3dPYydW47cSSkSWPnYCs5UDvfTd8kYemooWPO','cSosW4b+WOj7CCkHWPHADmocWORcQmkNbgOPxdzDoSkCu8kxCte','amoCW7jcDSotjcTRWQ5kW6VcKsGvcLBdRSk0WPu','WOjpWRO','W7RdHZHwqq','ESkPF3GaW7ybgmobWQbyrCoNkCkLW61UW4hdK20','W6lcMSo6Ah0','j+MrS+AmHG0','Amk2mmkAA0hdJ8kyWRDAW4yae8o1EgtdSfJcMeVdO8kLnaFdGmo8W4HajZZcQmo4','xmkVW4ydW4BdPJtcPK0OW6dcP1VcVxtdR8kRWPKYqCkKwG','uhFcGmoKW5RdNSkCW59zWOBcMmoSFrq2W4KanNG','WQybA8ke','WPVdLarbxSofqmo/r2FcVx/cKSkF','WPfCpmoivmoQva','44o3WRn9W5JdJSopW6PqCEodTEocQq','W7hcNJfiWODDW6T7W6hcOCkTW6ifwmkCW6ZdQgRcOLmA','uSodWR7cGXm','WQxcVCoxnxxdGcuNdCo8WQpdL8oXWRRcKZNcKqPdW7NcH2ZdSW','WQhcVJnZrmkrdCkJWQ/dUCkQiH/cPN45nmkM','zfz6WPvwirex','auGIWOVdJcGzW4JcR8kIWP1huYLYDa','W5xdVeWW','W4xcV8o9rLK','WQlcT8o0dNtdHq','WOxcH0mxh8oLjSoby0BcTq','WPVdLarbxSofqmo9s2tcKwhcLSkMqd95pCo1','eCoIW4C5WQ1dW4ZdQtBcPmkQW6ipEcddPSkkdG','WOSAFCoTWOtcVMmSCmomq8kYW4O9wmk/nW','44oKWRpdQCk4WQyfBSk4cEodOooaKmoBWQ8bW6We44kE57Ye5AYb5BEU5PMV5PsW776s','WPOAimk6o2vuW6XtWOTiWQm','WOOljmkNfKjfW71tWOvtWQS','WOZcQCouxCkMW7OYW6dcTCoBcw7cS8oWjCkKyaa'];}()));}()));}());_0x4d19=function(){return _0x273baf;};return _0x4d19();};var version_ = 'jsjiami.com.v7';
