const device = require('@system.device')
const fetch = require('@system.fetch')
const router = require('@system.router')
const shortcut = require('@system.shortcut')
const app = require('@system.app')
const storage = require('@system.storage')

function getUserIdLogic(that){
    that.currentStep = 4
    let p = getHeaderJson(that);
        p.then(data=>{ //读取headerJson成功
        if(data){
            let headerJson=JSON.parse(data);
            that.$app.shenceLog && that.$app.shenceLog.fnSetCommonArgs({
                ChannelCode: headerJson.channelCode || ''
            })
            headerJson.appStartScene = that.$app.startScene || 'other'
            headerJson.sourceChannel = that.$app.sourceInfo && that.$app.sourceInfo.sourceCid || ''
            headerJson.sourcePackageName = that.$app.sourcePackageName || ''
            that.currentStep = 5
            shortcut.hasInstalled({
                success: function(res) {
                    let fnGetCreateTime = that.$app.$def.fnGetCreateTime.call(that)
                    let fnGetInstallTime = that.$app.$def.fnGetInstallTime.call(that)
                    Promise.all([fnGetCreateTime, fnGetInstallTime]).then(result => {
                        if(result[0] || result[1]) {
                            that.$app.shenceLog.fnSetCommonArgs({
                                RegisterDate: result[0] || result[1] 
                            })
                        }
                        let property = {
                            StartPath: that.$page.uri,
                            BookID: that.bookId ? that.bookId : '无',
                            DesktopState: res ? 'Saved' : 'Notsaved',
                        }
                        that.$app.shenceLog.log(that, 'appLaunch', '', property);
                        if(that.isScLogin && headerJson.userId) {
                            that.$app.sensors.login(headerJson.userId);
                        }
                        that.$app.shenceLog.log(that, 'pageShow', '', {
                            Title: that.$page.name === 'LoginVisitor' ? '拉起' : '投放拉起'
                        });
                        that.$app.isScStart = true
                        if(that.shenceTime) {
                            that.shenceTime.loginTime = Date.now();                 // 记录神策登录的时间
                            that.fnShenceTimeCheck && that.fnShenceTimeCheck();     // 神策时间校验
                        }
                    })
                    if(res){
                        that.$app.hasAddcut = true
                        that.channelCode = headerJson.channelCode;
                    }else{
                        if(headerJson.channelCode && (that.channelCode=='' || !that.$app.$data.channelCode || that.channelCode==that.$app.$data.channelCode)){
                            that.channelCode = headerJson.channelCode;
                        }else{
                            if(headerJson.channelCode!=that.channelCode){
                                headerJson.triggerTime = that.$app.$def.getLogTime()
                                that.$app.shenceLog.log(that,'track','ChangeChannel', {
                                    DesktopState:'Notsaved'
                                });
                            }
                        }
                    }
                    if(headerJson.bookshelfStyle&&(that.bookshelfStyle=='')){
                        that.bookshelfStyle = headerJson.bookshelfStyle;							
                    }
                    headerJson.bookshelfStyle = that.bookshelfStyle;
                    headerJson.channelCode = that.channelCode;
                    that.$app.shenceLog && that.$app.shenceLog.fnSetCommonArgs({
                        ChannelCode: headerJson.channelCode || ''
                    })
                    console.log('bookshelfStyle',headerJson.bookshelfStyle);
                    headerJson.scDistinctId = that.$app.$def.sGetDistinctId()?that.$app.$def.sGetDistinctId():''
                    that.$app.$def.setStorageFile(that,{
                        key:'headerJson',
                        value:headerJson
                    })
                    that.$app.headerJson = headerJson
                    device.getInfo({
                        success: function (res) {
                            if(!that.$valid){
                                return;
                            }
                            headerJson.osvc = res.osVersionCode
                            headerJson.osvn = res.osVersionName
                            headerJson.pfvn = res.platformVersionName
                            headerJson.pfvc = res.platformVersionCode
                            
                            that.$app.$def.setStorageFile(that,{
                                key:'headerJson',
                                value:headerJson
                            })
                            that.$app.headerJson = headerJson
                        }
                    })
                    console.log(`channelCode channelCode channelCode channelCode = ${that.channelCode}`)
                    that.currentStep = 51
                    if(headerJson.utdid){
                        that.device.utdid = headerJson.utdid;
                        if(headerJson.userId){ //有userId && 有真实的utdid 进入首页
                            that.userId = headerJson.userId;
                            that.currentStep = 52
                            routeIndex(that);
                        }else{  //没有userId，用真实的utdid生成userId
                            getUserId(that,that.device.utdid);
                        }
                    }else{
                        if(headerJson.userId){
                            that.userId = headerJson.userId;
                            if(headerJson.utdidTmp){ //没有真实的utdid && 有userId && 有临时utdid 进入首页
                                that.currentStep = 52
                                routeIndex(that);
                            }else{ //没有真实的utdid && 有userId && 没有临时utdid 生成临时的utdid 重新生成userId
                                let utdidTmp = createUtdidTmp(that);
                                getUserId(that,utdidTmp);
                            }
                        }else{ //没有真实的utdid && 没有userId && 没有真实的utdid 生成临时的utdid 生成userId
                            if(headerJson.utdidTmp){
                                getUserId(that,headerJson.utdidTmp);
                            }else{
                                let utdidTmp = createUtdidTmp(that);
                                getUserId(that,utdidTmp);
                            }
                        }
                    }
                },
                fail: function() {
                    that.$app.$def.quickappLog([703, {
                        site: '1',
                    }, 'get_shortcut_install_fail'], that);
                }
            })
            
        }else{ //data为空字符串
            that.currentStep = 6
            let utdidTmp = createUtdidTmp(that);
            getUserId(that,utdidTmp); //如果缓存没有headerJson数据，则生成临时的utdid去生成userId
        }
    },
    (data)=>{//读取headerJson失败
        let utdidTmp = createUtdidTmp(that);
        getUserId(that,utdidTmp); //如果读取headerJson失败，则生成临时的utdid去生成userId
    })
    // getOnlyUserId(that)
    if(that.vid) {
        that.$app.shenceLog.log(that, 'track', 'VivoMsgClick', {
            TemplateId: that.vid,
        });
    }
}
function getOnlyUserId(that){
    device.getUserId({
        success: function(data) {
            console.log(`handling success: ${data.userId}`)
            that.$app.$def.quickappLog([703, {
                qmap:{
                    id:data.userId,
                    site:'1'
                }
            }, 'getOnlyUserId'], that)
        },
        fail: function(data, code) {
            console.log(`handling fail, code = ${code}`)
            that.$app.$def.quickappLog([703, {
                qmap:{
                    code:code,
                    data:data,
                    site:'2'
                }
            }, 'getOnlyUserId'], that)
        }
    })
    if(that.vid) {
        that.$app.shenceLog.log(that, 'track', 'VivoMsgClick', {
            TemplateId: that.vid,
        });
    }
}
function getHeaderJson(that){
    if(!that.$valid){
        return;
    }
    return new Promise((resolve,reject)=>{
        that.$app.$def.getStorageFile(that,{
            key:'headerJson',
            success:function(data){
                if(!that.$valid){
                    return;
                }
                that.$app.$def.quickappLog([703, {
                    qmap:{
                        page:'1',
                        site:'1',
                        headerJson:data
                    }
                }, 'getHeaderJson'], that)
                resolve(data);
            },
            fail:function(data, code){
                that.$app.$def.quickappLog([703, {
                    qmap:{
                        page:'1',
                        site:'2',
                        headerJson:data,
                        source:'getStorage_HeaderJson_fail',
                        thisUri:that.$page.uri,
                        data,
                        code
                    }
                }, 'catch_error'], that)
                reject(code);
            }
        })
    })
}

function  createUtdidTmp(that){ //生成临时的utdid
    let utdidTmp = getUtdidTmp();
    that.device.utdidTmp = that.$app.$def.hex_md5(utdidTmp);
    return utdidTmp;
}

function getUtdidTmp(){
    var sChar = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var aChar = sChar.split('');
    aChar.sort(function() {
        return (0.5-Math.random());
    })
    sChar = aChar.join('');
    var oDate = new Date();
    var r = rnd(0,sChar.length-10);
    var str = sChar.substr(r,10);
    var utdidTmp = 'tmp_'+oDate.getTime()+str;
    return utdidTmp;        
}
function rnd(n,m){
    return parseInt(Math.random()*(m-n+1))+n;
}
function getUserId(that,utdidTmp){
    console.info("获取userid");
    let oGetAndroidId = new Promise((resolve,reject)=>{
        device.getUserId({
            success: function(data) {
                that.device.androidId = data.userId
                resolve()
                that.$app.$def.quickappLog([703, {
                    qmap:{
                        // id:data.userId,
                        site:'1'
                    }
                }, 'getAndroidId'], that)
            },
            fail: function(data, code) {
                resolve()
                that.$app.$def.quickappLog([703, {
                    qmap:{
                        code:code,
                        data:data,
                        site:'2'
                    }
                }, 'getAndroidId'], that)
            }
        })
    })
    
    // let oGetId
    // if(that.channelCode==that.$app.$data.channelCode){
    //     // clearTimeout(that.stopTimer)
    //     oGetId = new Promise((resolve, reject) => {
    //         device.getId({
    //             type: ['device', 'mac'],
    //             success: function (res) {
    //                 that.device.ei = res.device;			
    //                 that.device.mac = res.mac;
    //                 that.device.utdid = that.$app.$def.hex_md5(res.device + res.mac);
    //                 resolve(res);
    //                 //获取设备信息成功打点
    //                 that.$app.$def.quickappLog([703, {
    //                     qmap:{
    //                         page:'10',
    //                         site:'1',
    //                         channelCode:that.channelCode,
    //                         jumpPage:that.jumpPage,
    //                         bookId:that.bookId,
    //                         chapterId:that.chapterId,
    //                         chapterName:that.chapterName,
    //                         uuid:that.uuid
    //                     }
    //                 }, 'device_getid'], that)
    //             },
    //             fail: function (data, code) {
    //                 //获取设备信息失败打点
    //                 resolve();
    //                 that.$app.$def.quickappLog([703, {
    //                     qmap:{
    //                         page:'10',
    //                         site:'2',
    //                         channelCode:that.channelCode,
    //                         jumpPage:that.jumpPage,
    //                         bookId:that.bookId,
    //                         chapterId:that.chapterId,
    //                         chapterName:that.chapterName,
    //                         uuid:that.uuid
    //                     }
    //                 }, 'device_getid'], that)
    //             }
    //         })
    //     })
    // }
    
    let oGetInfo = new Promise((resolve, reject) => {
        device.getInfo({
            success: function (res) {
                if(!that.$valid){
                    return;
                }
                that.device.brand = res.brand;
                that.device.model = res.model;
                that.device.osvn = res.osVersionName
                that.device.osvc = res.osVersionCode
                that.device.scw = res.screenWidth
                that.device.sch = res.screenHeight
                that.device.pfvn = res.platformVersionName
                that.device.pfvc = res.platformVersionCode
                resolve(res);
                //获取用户信息成功打点
                that.$app.$def.quickappLog([703, {
                    qmap:{
                        page:'10',
                        site:'1',
                        channelCode:that.channelCode,
                        jumpPage:that.jumpPage,
                        bookId:that.bookId,
                        chapterId:that.chapterId,
                        sid:that.sid,
                        chapterName:that.chapterName,
                        uuid:that.uuid
                    }
                }, 'device_getinfo'], that)
            },
            fail:function(data,code){
                //获取用户信息失败打点
                that.$app.$def.quickappLog([703, {
                    qmap:{
                        page:'10',
                        site:'2',
                        channelCode:that.channelCode,
                        jumpPage:that.jumpPage,
                        bookId:that.bookId,
                        chapterId:that.chapterId,
                        sid:that.sid,
                        chapterName:that.chapterName,
                        uuid:that.uuid,
                        source:'device_getInfo_fail',
                        thisUri: that.$page.uri,
                        data,
                        code
                    }
                }, 'catch_error'], that)
            }
        })
    })
    // if(that.channelCode==that.$app.$data.channelCode){
    //     Promise.all([oGetId,oGetAndroidId,oGetInfo]).then((result) => {
    //         reTryTimeout(that)            
    //         login(that,utdidTmp)
    //     },()=>{
    //         reTryTimeout(that)
    //         that.$app.$def.quickappLog([703, {
    //             qmap:{
    //                 source:'oGetInfo_fail',
    //                 thisUri:that.$page.uri
    //             }
    //         }, 'catch_error'], that)
    //         routeIndex(that,'/Preference');
    //     })
    // }else{
        Promise.all([oGetAndroidId,oGetInfo]).then((result) => {
            that.currentStep = 7
            login(that,utdidTmp)
        },()=>{
            that.currentStep = 8
            that.$app.$def.quickappLog([703, {
                qmap:{
                    source:'oGetInfo_fail',
                    thisUri:that.$page.uri
                }
            }, 'catch_error'], that)
            routeIndex(that,'/Preference');
        })
    // }
}

function reTryTimeout(that){
    that.stopTimer=setTimeout(function(){
        that.isShowBtn = true;
        that.isLoading = true;
        that.$app.$def.quickappLog([703, {
            qmap:{
                thisUri:that.$page.uri,
            }
        }, 'lvstop'], that)
    }, 2000);
}
function login(that,utdidTmp){
    let headerJson={}
    if(JSON.stringify(that.$app.headerJson) != "{}"&&(that.$app.headerJson.utdidTmp != ''||that.$app.headerJson.utdid != '')){
        headerJson = that.$app.headerJson
        that.$app.$def.quickappLog([703, {
            qmap:{
                site:'1',
                headerJson:headerJson
            }
        }, 'app_herderJson'], that)
    }else{
        headerJson={
            brand:that.device.brand || 'empty',
            model:that.device.model || 'empty',
            osvn:that.device.osvn || 'empty',
            osvc:that.device.osvc || 'empty',
            scw:that.device.scw || 'empty',
            sch:that.device.sch || 'empty',
            pfvn:that.device.pfvn || 'empty',
            pfvc:that.device.pfvc || 'empty',
            utdidTmp: utdidTmp,
            utdid: that.device.utdid,
            domain: that.config.domain,
            userId: that.userId,
            t: that.t,
            pname: that.config.pname,
            channelCodeFee:that.channelCode, 
            channelCode:that.channelCode, //新增和充值都用它标记
            uuid:that.uuid,
            readPref:'0',
            bookshelfStyle:that.bookshelfStyle
        }
        headerJson.scDistinctId = that.$app.$def.sGetDistinctId()?that.$app.$def.sGetDistinctId():''
        headerJson.triggerTime = that.$app.$def.getLogTime()
        that.$app.$def.setStorageFile(that,{
            key:'headerJson',
            value:headerJson,
            success() {
                console.info('成功加入缓存');
            }
        })
        headerJson.appStartScene = that.$app.startScene || 'other'
        headerJson.sourceChannel = that.$app.sourceInfo && that.$app.sourceInfo.sourceCid || ''
        headerJson.sourcePackageName = that.$app.sourcePackageName || ''
        that.$app.headerJson = headerJson
    }
    that.$app.shenceLog && that.$app.shenceLog.fnSetCommonArgs({
        ChannelCode: headerJson.channelCode || ''
    })
    if(!headerJson.pname){
        return false;
    }
    let dataJson={
        ei: that.device.ei,
        domain: that.config.domain,
        utdid: that.device.utdid || utdidTmp, //上行用utdid接收，有正式的传正式的 没有正式的传临时的
        brand: that.device.brand,
        model: that.device.model,
        channelCode: that.channelCode,
        bookId:that.bookId,
        chapterId:that.chapterId,
        sid:that.sid,
        blackList:1,
        androidId:that.noback?'':that.device.androidId||'',
        isUnion:that.isUnion,
        uuid:that.$app.sourceInfo['uuid'],
        pullMode:that.$app.sourceInfo['pullMode'],
        isAddBf: 0,
    };	
    fetch.fetch({
        method: 'POST',
        url:that.$app.api+'/glory/fastapp/2101?'+that.config.appVer,
        header: headerJson,
        data: JSON.stringify(dataJson),
        success: function (ret) {
            if(!that.$valid){
                return;
            }
            if(ret.code==200){
                let res=JSON.parse(ret.data);
                if(res.retCode==0){
                    that.$app.shenceLog && that.$app.shenceLog.fnSetCommonArgs({
                        RegisterDate: (res.data && res.data.ctime) || new Date().getTime()
                    })
                    res.data && res.data.ctime && that.$app.$def.setStorageFile(that, {
                        key: 'createTime',
                        value: res.data.ctime,
                    })
                    that.$app.isNewUser = !!res.data.isNewUser;                          // 是否新用户
                    that.userId=res.data.userId;
                    that.$app.sensors.login(that.userId);
                    let rDate = new Date(res.data.ctime)
                    let rYear = rDate.getFullYear()
                    let rMonth = rDate.getMonth()
                    let rDay = rDate.getDate()
                    let cDate = new Date()
                    let cYear = cDate.getFullYear()
                    let cMonth = rDate.getMonth()
                    let cDay = rDate.getDate()
                    let IsNewUser = false
                    if(rYear==cYear&&rMonth==cMonth&&rDay==cDay){
                        IsNewUser = true
                    }
                    shortcut.hasInstalled({
                        success: function(rel) {
                            let property = {
                                StartPath: that.$page.uri,
                                BookID: that.bookId ? that.bookId : '无',
                                DesktopState: rel ? 'Saved' : 'Notsaved',
                            }
                            that.$app.shenceLog.log(that, 'appLaunch', '', property);
                            that.$app.shenceLog.log(that, 'pageShow', '', {
                                Title: that.$page.name === 'LoginVisitor' ? '拉起' : '投放拉起'
                            });
                            that.$app.isScStart = true
                            that.ctime=res.data.ctime;
                            headerJson.userId=res.data.userId;
                            headerJson.channelCode=res.data.channelCode||that.$app.$data.channelCode;
                            that.$app.shenceLog && that.$app.shenceLog.fnSetCommonArgs({
                                ChannelCode: headerJson.channelCode || ''
                            })
                            headerJson.readPref=res.data.sex.toString();
                            that.$app.sourceInfo['isRegister'] = true
                            if(res.data.isBlack){
                                headerJson.utdid = ''
                            }
                            let p1 = new Promise((resolve,reject)=>{
                                that.$app.$def.setStorageFile(that,{
                                    key:'headerJson',
                                    value:headerJson,
                                    complete:function(){
                                        resolve();
                                    }
                                })
                            })
                            that.$app.headerJson = headerJson
                            let p2 = new Promise((resolve,reject)=>{
                                that.$app.$def.setStorageFile(that,{
                                    key:'userId',
                                    value:res.data.userId,
                                    complete:function(){
                                        resolve();
                                    }
                                })
                            })	
                            let p3 = new Promise((resolve,reject)=>{ //储存用户创建时间
                                let oDate = new Date();
                                let oTime = oDate.getTime();
                                that.$app.$def.setStorageFile(that,{
                                    key:'installationTime',
                                    value:oTime,
                                    complete:function(){
                                        resolve();
                                    }
                                })
                            })	
                            Promise.all([p1,p2,p3]).then(()=>{
                                that.isOlder=0
                                let {source} = app.getInfo()
                                that.$app.$def.quickappLog([703, {
                                    qmap:{
                                        source:'promise_all_suc',
                                        thisUri:that.$page.uri,
                                        sourceType: source.type
                                    }
                                }, 'loginv_go_other'], that)
                                if(res.data.sex!=0){
                                    routeIndex(that);
                                }else{
                                    routeIndex(that,'/Preference');
                                }
                            })
                            //记录440版本注册的用户
                            that.$app.$def.setStorageFile(that,{
                                key:'newUser',
                                value:'1'
                            })
                        },
                        fail: function() {
                            that.$app.$def.quickappLog([703, {
                                site: '2',
                            }, 'get_shortcut_install_fail'], that);
                        }
                    })
                }else{
                    that.$app.$def.quickappLog([703, {
                        qmap:{
                            source:'retCode_f0',
                            retCode:res.retCode,
                            thisUri:that.$page.uri,
                        }
                    }, 'loginv_go_preference'], that)
                    routeIndex(that,'/Preference');
                }
            }else{
                that.$app.$def.quickappLog([703, {
                    qmap:{
                        source:'code_f200',
                        code:ret.code,
                        thisUri:that.$page.uri,
                    }
                }, 'loginv_go_preference'], that)
                routeIndex(that,'/Preference');
            }						
        },
        fail: function (data, code) {
            that.$app.$def.quickappLog([703, {
                qmap:{
                    source:'fetch_2101data_fail',
                    thisUri:that.$page.uri,
                    data,
                    code
                }
            }, 'catch_error'], that)
            routeIndex(that,'/Preference');
        }
    })
}
function isAgreement(that,pageName,paramJson){

    // 查看缓存中是否有授权   agreement = {isUpa:res.data.isUpa};
    try {
        that.$app.$def.getStorageFile(that,{
            key:'agreement',
            success:function(data){
                if(data){
                    let ret = JSON.parse(data);
                    console.log(ret.showAgreement,'has agreement')

                    if(ret.showAgreement == 1){
                        
                        that.$app.$def.quickappLog([703,{
                            qmap:{
                                source:'login',
                                mag:'olduser_go_Pre'
                            }
                        },'agreement'], that);

                        pageName='/Preference';
                        routerJump(that,pageName,paramJson)
                    }else{
                        routerJump(that,pageName,paramJson)
                    }
                }
            },
            fail:function(data, code){
                routerJump(that,pageName,paramJson)
            }
        })
    } catch (error) {
        routerJump(that,pageName,paramJson)
    }
    
}
function routerJump(that,pageName,paramJson){
    that.currentStep = 9
    clearTimeout(that.stopTimer);
    router.clear()
    router.replace({
        uri:pageName,
        params:paramJson
    })
}
function routeIndex(that,url){
    that.$app.$def.requestData(that, {
        interface: '/glory/fastapp/2178',
        data: {
            channelCode: that.$app.headerJson.channelCode,
            sourceChannel: that.$app.sourceInfo.sourceCid,
            startMode: that.$app.sourceInfo.infoType,
            uuid: that.$app.sourceInfo.uuid,
            pullJson: that.$app.sourceInfo.pullJson,
            landJson: that.$app.sourceInfo.landJson,
        }
    })
    that.$app.$def.quickappLog([701, {
        qmap:{
            sorce:'route',
            isJump:that.isJump,
            channelCode:that.channelCode,
            bookId:that.bookId,
            chapterId:that.chapterId,
            sid:that.sid,
            uuid:that.uuid,
            jobId:that.jobId,
            jumpPage:that.jumpPage,
            url:url
        }
    }], that)
    
    let pageName='';
    let paramJson={};
    let customObj = {}
    switch(that.jumpPage.toLowerCase()){
        case '':
        case 'index':
            if(url){
                pageName=url;
                routerJump(that,pageName,paramJson)
            }else{
                pageName='/Openscreen';
                paramJson = {frompage:0}
                // isPref
                if(that.isToPreference){
                    routerJump(that,'/Preference');
                }else{
                    routerJump(that,pageName,paramJson)
                }
            }
            break;
        case 'read':
            if(!that.bookId || that.bookId && !(/^\d+$/.test(that.bookId))) {
                that.$app.$def.requestData(that, {
                    interface: '/glory/fastapp/2179',
                    data: {
                        type: 3,
                        detail: '拉起书籍bookId错误: ' + that.bookId
                    },
                });
                clearTimeout(that.stopTimer);
                router.clear()
                router.replace({
                    uri:'/Index'
                })
                break;
            }
            pageName='/Read';
            if(that.source==''){
                var trigger_time = that.$app.$def.getLogTime()
                var omap = {
                    origin:that.jobId?'push':'tgsj',
                    action:'2',
                    channel_id:that.jobId?that.jobId:that.$app.sourceInfo['sourceCid'],
                    channel_name:that.jobId?'推送':'投放渠道',
                    channel_pos:0,
                    column_id:that.jobId?that.jobId:that.$app.sourceInfo['sourceCid'],
                    column_name:that.jobId?'推送':'投放渠道',
                    column_pos:0,
                    content_id:that.bookId,
                    content_pos:0,
                    content_type:'2',
                    trigger_time:trigger_time
                }
            }
            paramJson={
                isAdShow: that.isAdShow,
                oppoLock: that.oppoLock,
                onBackPressToPage:'/Index',
                bookId:that.bookId,
                chapterId:that.chapterId,
                sid:that.sid,
                chapterName:that.chapterName,
                isAuthorize:that.isAuthorize,
                isOlder:that.isOlder,
                calledPlatform:that.calledPlatform,
                SourcePosition:'注册页',
                fromPlace:'login',
                omap:that.source==''?omap:{},
                isUpdateOmap:that.source==''?1:0
            }
            that.$app.$def.quickappLog([702, {
                omap:omap
            }, 'book_click'], that)
            routerJump(that,pageName,paramJson)
            break;
        case 'recharge':
            pageName='/Recharge';
            paramJson={
                payChannelCode:that.payChannelCode,
                msid:that.msid,
            }
            routerJump(that,pageName,paramJson)
            break;
        case 'sign':
            pageName='/Sign';
            router.clear()
            routerJump(that,pageName,paramJson)
            break;
        case 'webhuodong':
            pageName='/Webhuodong';
            paramJson={
                webSrc:that.webSrc,
            }
            routerJump(that,pageName,paramJson)
            break;
        case 'custom':
            try {
                if(that.customObj) {
                    customObj = JSON.parse(decodeURIComponent(that.customObj))
                }
            }catch(e) {}
            that.currentStep = 10
            clearTimeout(that.stopTimer);
            router.clear()
            router.replace({
                uri: that.customUrl ? '/' + that.customUrl : '/Index',
                params: customObj
            })
            break;
        default:
            that.currentStep = 10
            clearTimeout(that.stopTimer);
            router.clear()
            router.replace({
                uri:'/Index'
            })
    }
}

export default{
    getUserIdLogic
}