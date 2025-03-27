
/**
 * 请求接口获取数据函数
 * data为通过storage获取的header
 * 可以在回调函数内直接写fetch
 * that.$app.$def.requestData(storage,{
 *      interface:'',
 *      data:{},
 *      succ:function(){},
 *      error:functioin(){}
 * })
 */
const device = require('@system.device')
const fetch = require('@system.fetch')
const storage = require('@system.storage')
const file = require('@system.file')
const router = require('@system.router')
const prompt = require('@system.prompt')
const app = require('@system.app')
const push = require('@service.push')

// 防抖-立即执行
function debounce(func,wait) {
    let timeout;
    return function () {
        let context = this;
        let args = arguments;

        if (timeout) clearTimeout(timeout);

        let callNow = !timeout;
        timeout = setTimeout(() => {
            timeout = null;
        }, wait)

        if (callNow) func.apply(context, args)
    }
}
// 节流
function throttle(fn, threshhold) {
    // 记录上次执行的时间
    var last

    // 定时器
    var timer

    // 默认间隔为 250ms
    threshhold || (threshhold = 250)

    // 返回的函数，每过 threshhold 毫秒就执行一次 fn 函数
    return function () {

        // 保存函数调用时的上下文和参数，传递给 fn
        var context = this
        var args = arguments

        var now = +new Date()

        // 如果距离上次执行 fn 函数的时间小于 threshhold，那么就放弃
        // 执行 fn，并重新计时
        if (last && now < last + threshhold) {
        clearTimeout(timer)

        // 保证在当前时间区间结束后，再执行一次 fn
        timer = setTimeout(function () {
            last = now
        }, threshhold)

        // 在时间区间的最开始和到达指定间隔的时候执行一次 fn
        } else {
        last = now
        fn.apply(context, args)
        }
    }
}

function requestData(that,json){
    let config=that.$app.$data;
    let api = that.$app.api
    let headerJson={};
    if(JSON.stringify(that.$app.headerJson) != "{}"){
        headerJson = that.$app.headerJson
        if(config.pname){
            headerJson.pname=config.pname
        }
        fnFetch(headerJson);    
    }else{
        new Promise((resolve,reject)=>{
            // storage.get({
            //     key: 'headerJson',
            //     success:function(data){
            //         resolve(data);
            //     }
            // })
            that.$app.$def.getStorageFile(that,{
                key:'headerJson',
                success:function(data){
                    if(!that.$valid){return;}
                    resolve(data);
                },
                fail:function(){
                    resolve();
                }
            })
    
        }).then(function(data){
            if(data){
                headerJson=JSON.parse(data);
                if(config.pname){
                    headerJson.pname=config.pname
                }
                fnFetch(headerJson);    
            }else{
                fnGetUtdidToRequest();
            }
        },function(){
            console.info('或得数据失败');
            fnGetUtdidToRequest(); 
        })
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
        var utdidTmp = "tmp_"+oDate.getTime()+str;
        return utdidTmp;        
    }
    function rnd(n,m){
        return parseInt(Math.random()*(m-n+1))+n;
    }
    function fnGetUtdidToRequest(){
        // let utdid='';
        // let oGetId = new Promise((resolve, reject) => {
        //     device.getId({
        //         type: ['device', 'mac'],
        //         success: function (res) {
        //             if(!that.$valid){return;}
        //             utdid = that.$app.$def.hex_md5(res.device + res.mac);
        //             if(res){
        //                 resolve(res);
        //             }else{
        //                 reject();
        //             }
        //         },
        //         fail: function (data, code) {
        //             reject(code);                   
        //         }
        //     })
        // })
        
        let utdidTmp = getUtdidTmp();

        let oGetInfo = new Promise((resolve, reject) => {
            device.getInfo({
                success: function (res) {
                    if(!that.$valid){return;}
                    if(res){
                        resolve(res);
                    }else{
                        reject();
                    }
                },
                fail: function (data, code) {
                    reject(code);                   
                }
            })
        })
        
        
        
        oGetInfo.then((result) => {
            let headerJson_bak={
                brand:result.brand || 'empty',
                model:result.model || 'empty',
                utdid: utdidTmp,
                domain: config.domain,
                userId: '',
                t: '',
                pname: config.pname,
                channelCodeFee:'',
                channelCode:'',
                readPref:'0',
            }	
            console.log('========在storage中获取header失败，写死相关header=========')
            console.log(headerJson_bak)
            fnFetch(headerJson_bak)
        }).catch((error) => {
            let headerJson_bak={
                brand:'empty',
                model:'empty',
                utdid: utdidTmp,
                domain: config.domain,
                userId: '',
                t: '',
                pname: config.pname,
                channelCodeFee:'',
                channelCode:'',
                readPref:'0',
            }	
            fnFetch(headerJson_bak)
        });
    }
    function fnFetch(headerJson){
        
        fetch.fetch({
            method: "POST",
            url:api+json.interface+"?"+config.appVer,
            header: headerJson,
            data: JSON.stringify(json.data),
            success: function (ret) {
                if(ret.code==200){
                    if(!that.$valid){return;}
                    that.bShow=true;//让页面显示
                    let res = JSON.parse(ret.data);
                    if(res.retCode != 0) {
                        json.notEqualZero && json.notEqualZero(res);
                    }
                    if(res.retCode==0){//需要登录
                        if(res.isExpire==1){
                            headerJson.t='';
                            headerJson.userId='';
                            setStorageFile(that,{
                                key:'headerJson',
                                value:headerJson,
                            })
                            return false;    
                        }
                        json.succ && json.succ(res);
                    }else if(res.retCode==6){
                        if(json.interface.indexOf('2121')>=0){ //删除云书架接口
                            json.succ && json.succ(res);
                            return false;
                        }
                        router.replace({
                            uri: '/Login',
                            params: {
                                url:json.data.url,
                                bookId:json.data.bookId,
                                chapterId:json.data.chapterId,
                                chapterIndex:json.data.chapterIndex,
                                fromurl:json.data.fromurl,
                                autoPay:json.data.auto,
                                isFromVip:json.data.isFromVip,
                                SourcePosition:json.data.SourcePosition,
                                omap:json.data.omap,
                                isUpdateOmap:json.data.isUpdateOmap,
                                pageFrom: json.data && json.data.pageFrom ? json.data.pageFrom : '',
                                positionName: '登陆拦截'
                            }
                        });
                        return false;
                    }else if(res.retCode==100){
                        json.succ && json.succ(res);
                        return false;
                    }
                }else{
                    console.log(`服务器出错，请稍后再试:${JSON.stringify(ret)}`)
                    prompt.showToast({
                        message: '服务器出错，请稍后再试'
                    })
                    json.fail && json.fail();
                }                       
            },
            fail: function (data, code) {
                console.log('网络出错，请稍后再试')
                prompt.showToast({
                    message: '网络出错，请稍后再试'
                });
                json.error && json.error(code,data);
                json.fail && json.fail();
            }
        })
    }
}
/**
 * 写入缓存、写入文件
 * @param {*} that 
 * @param {*} json.key 
 * @param {*} json.value 
 * @param {*} json.complete 
 * this.$app.$def.setStorageFile(that,{
 *      key:'headerJson',
 *      value:headerJson,
 *      complete:function(){}
 * })
 */
function setStorageFile(that,json={}){
    // var json = json || {};
    let config=that.$app.$data;
    let finalValue='';
    switch(typeof json.value){
        case 'object':
            finalValue = JSON.stringify(json.value);
            break;
        default:
            finalValue = json.value;
    }

    let p1 = new Promise((resolve,reject)=>{
        storage.set({
            key: json.key,
            value: json.value,
            success:function(){
                json.success && json.success();
            },
            complete:function(){ //包括 success 和 fail
                resolve();
            }
        })
        //resolve();	    
    })
    let p2 = new Promise((resolve,reject)=>{
        file.writeText({
            uri: config.storageFilePath+json.key+'.txt',
            text: finalValue,
            complete:function(){ //包括 success 和 fail
                resolve();
            }
        })    
    })
    Promise.all([p1,p2]).then(function () {
        json.complete && json.complete();
    })
}
/**
 * 
 * @param {*} that 
 * @param {*} json 
 * this.$app.$def.getStorageFile(that,{
 *      key:'headerJson',
 *      value:headerJson,
 *      success:function(){},
 *      fail:function(){}
 * })
 */
function getStorageFile(that,json={}){
    // var json = json || {};
    let config=that.$app.$data;
    new Promise((resolve,reject)=>{
        storage.get({
            key: json.key,
            success:function(data){
                if(data){
                    json.success && json.success(data);
                    reject();
                }else{
                    resolve();
                }
            },
            fail:function(data,code) {
                resolve();
            }
        })    
    }).then((data)=>{
        file.readText({
            uri: config.storageFilePath+json.key+'.txt',
            success: function(data) {
                json.success && json.success(data.text);
            },
            fail: function(data, code) {
                json.fail && json.fail(data, code);
            },
            complete:function(){
                json.complete && json.complete(data);
            }
        })
    }, () => {})
}
function deleteStorageFile(that,json={}){
    // var json = json || {};
    let config=that.$app.$data;

    let p1 = new Promise((resolve,reject)=>{
        storage.delete({
            key: json.key,
            success: function(data) {
                resolve(data);
            },
            fail: function(data, code) {
                reject(data, code);
            }
        })    
    })
    let p2 = new Promise((resolve,reject)=>{
        file.delete({
            uri: config.storageFilePath+json.key+'.txt',
            success: function(data) {
                resolve(data);
            },
            fail: function(data, code) {
                reject(data, code);
            }
        })   
    })
    Promise.all([p1,p2]).then(function() {
        json.success && json.success();
    }, function() {
        json.fail && json.fail();
    })
}

function ajax(that,routercode, obj) {
    // let that = this;
    // console.log("ajax封装",that);
    
    that.$app.$def.requestData(that,
        {
            interface: `/glory/fastapp/${routercode}`,
            data: obj.data,
            succ: function (res) {
                console.info("请求成功ajax",res);
                if (res.retCode == 0) {
                    console.log('执行');
                    // obj.succ(res.data);
                    obj['succ'](res.data);
                }
            },
            error: function (code) {
                console.info('请求失败ajax',code);
                obj.err(code);
            },
            notEqualZero: function(res) {
                if(obj.notEqualZero) {
                    obj.notEqualZero(res)
                }
            }
        }
    )
}
function appSourceinfoLog(that){
    let isAllin = true
    let headerJson = {}
    that.$app.$def.getStorageFile(that,{
        key:'headerJson',
        success:function(data){
            headerJson=JSON.parse(data);
            let {source} = app.getInfo()
            that.$app.sourceInfo['infoType'] = source.type
            that.$app.sourceInfo['brand'] = headerJson.brand
            that.$app.sourceInfo['model'] = headerJson.model
            that.$app.sourceInfo['osvn'] = headerJson.osvn
            that.$app.sourceInfo['pfvn'] = headerJson.pfvn
            that.$app.sourceInfo['userid'] = headerJson.userId
            that.$app.sourceInfo['channelCode'] = headerJson.channelCode
            for(let key  in that.$app.sourceInfo){
                // console.log(key + '---' + that.$app.sourceInfo[key])
                if(key!='uuid'&&key!='sourceCid'&&key!='pullMode'&&key!='pullJson'&&key!='landJson'){
                    if(that.$app.sourceInfo[key]===''){
                        isAllin = false
                    }
                }
            }
            if(!that.$app.sourceInfoLoged&&isAllin){
                if(that.$app.isFirstLog) {
                    that.$app.isFirstLog = false
                    that.$app.$def.quickappLog([703, {
                        qmap:{
                            sourceInfo:that.$app.sourceInfo
                        }
                    }, 'appSourceinfoLog'], that)
                }
                device.getUserId({
                    success: function(res) {
                        console.log(`handling success: ${res.userId}`)
                        let androidId = res.userId
                        let getPushid = new Promise((res,rej)=>{
                            let getProvider = push.getProvider();
                            let regId = '';
                            push.subscribe({
                                success: function(data) {
                                    regId = data.regId;
                                    let isPush = 2
                                    storage.get({
                                        key:'isPush',
                                        success(pres){
                                            if(pres==1){
                                                isPush=1
                                            }
                                            res({regId,provider:isPush==2?getProvider:`${getProvider}_none`})
                                        }
                                    })
                                    that.$app.$def.quickappLog([703, {
                                        qmap:{
                                            page:'10',
                                            site:'1',
                                            data,
                                        }
                                    }, 'push_id'], that)
                                },
                                fail: function(data, code) {
                                    rej()
                                    that.$app.$def.quickappLog([703, {
                                        qmap:{
                                            page:'10',
                                            site:'2', 
                                            source:'push_subscribe_fail',
                                            thisUri: that.$page.uri,
                                            data,
                                            code
                                        }
                                    }, 'push_id'], that)
                                }
                            })
                        })
                        getPushid.then(res=>{
                            that.$app.sourceInfoLoged = true
                            that.$app.$def.requestData(that,{
                                interface: `/glory/fastapp/2173`,
                                data: {
                                    startMode:source.type,
                                    androidId: androidId,
                                    sourceCid:that.$app.sourceInfo['sourceCid'],
                                    uuid:that.$app.sourceInfo['uuid'],
                                    isRegister:that.$app.sourceInfo['isRegister'],
                                    pushCid:res.regId,
                                    provider:res.provider,
                                    pullJson:that.$app.sourceInfo['pullJson'],
                                    landJson:that.$app.sourceInfo['landJson']
                                },
                                succ: function (res) {
                                    console.log(res)
                                }
                            })
                        },err=>{
                            that.$app.sourceInfoLoged = true
                            that.$app.$def.requestData(that,{
                                interface: `/glory/fastapp/2173`,
                                data: {
                                    startMode:source.type,
                                    androidId: androidId,
                                    sourceCid:that.$app.sourceInfo['sourceCid'],
                                    uuid:that.$app.sourceInfo['uuid'],
                                    pullJson:that.$app.sourceInfo['pullJson'],
                                    landJson:that.$app.sourceInfo['landJson']
                                },
                                succ: function (res) {
                                    console.log(res)
                                }
                            })
                        })
                    }
                })
            }
            console.log('isAllin',isAllin)
        }
    })
}
function changeApi(that){
    return new Promise((resolve,reject)=>{
        fetch.fetch({
            method: 'GET',
            url: 'https://www.baidu.com',
            success: function (ret) {
                if(ret.code==200){
                    //切换域名
                    that.$app.curApiNum++
                    if(that.$app.curApiNum==that.$app.backUpApi.length){
                        that.$app.curApiNum = 0
                    }
                    console.log('切换api。。。。。。。。。')
                    that.$app.api = that.$app.backUpApi[that.$app.curApiNum]
                    that.$app.$def.quickappLog([703, {
                        qmap:{
                            api:that.$app.api,
                            page:that.$page.path
                        }
                    }, 'changeApi'], that)
                    that.$app.$def.requestData(that,{
                        interface: '/glory/fastapp/2174',
                        data: { page: that.$page.path,event:'changeApi',content:JSON.stringify({api:that.$app.api,page:that.$page.path})},
                        succ: function (res) {
                            console.log(res)
                        }
                    })
                    resolve()
                }else{
                   console.log('当前确实无网络。。。。。。。')
                   reject()
                }
            },
            fail: function (data,code) {
                console.log('当前确实无网络。。。。。。。')
                reject()
            }
        })
    })
}

// 创建页面的广告存储对象
function fnCreateAd() {
    let pageName = this.$page.name;
    this.$app.bannerAd[pageName] = {}
    this.$app.videoAd[pageName] = {}
    this.$app.feedAd[pageName] = [];
    this.$app.adInstances[pageName] = {}
}

// 销毁页面的广告
function fnDestoryAd() {
    if (!this || !this.$valid || !this.$app || !this.$app.bannerAd || !this.$page.name) {
        return false;
    }
    let pageName = this.$page.name,
        allBannerAd = this.$app.bannerAd[pageName];
    if (Object.prototype.toString.call(allBannerAd).slice(8, -1) !== 'Object') {
        return false;
    }
    for (let key in allBannerAd) {                                  // banner广告需要隐藏和销毁
        let ad = allBannerAd[key];
        if (key.indexOf('ad_') === 0 && ad) {
            ad.hide && ad.hide();
            ad.destroy && ad.destroy();
        }
    }
    this.$app.fnDeletePageAdCaches(pageName);                       // 删除该页面缓存的广告
    fnCreateAd.call(this);
}

/**
 * 添加书籍到书架
 * @param   {Object}    data    [上行参数，bookId, chapterId, omap]
 * @return  {Promise}           [返回接口请求结果]
*/
function fnAddBookToBookShelf(data) {
    if (!data) {
        console.error('---2822接口上行参数缺失---');
        return Promise.resolve(false);
    }
    return new Promise((resolve, reject) => {
        requestData(this, {
            interface: '/glory/fastapp/2822',
            data,
            succ: res => {
                if (res && res.retCode === 0 && res.data) {
                    return resolve(res);
                }
                return resolve(false);
            },
            fail: () => {
                resolve(false);
            }
        });
    });
}

// 节流
function fnThrottle(fn, delay = 1500) {
    let lastTime;
    return function () {
        let nowTime = Date.now();
        if (!lastTime) {                            // 第一次直接执行
            fn.apply(this, arguments);
            lastTime = nowTime;
            return ;
        }
        if (nowTime - lastTime > delay) {           // 之后每次达到节流时间，才执行处理函数
            fn.apply(this, arguments);
            lastTime = nowTime;
        }
    }
}

// 防抖
function fnDebounce (fn, delay = 250) {
    let timer;
    return function () {
        let args = arguments;
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn.apply(this, args);
            clearTimeout(timer);
            timer = null;
        }, delay);
    }
}

export default {
    debounce,
    requestData,
    setStorageFile,
    getStorageFile,
    deleteStorageFile,
    throttle,
    ajax,
    appSourceinfoLog,
    changeApi,
    fnCreateAd,
    fnDestoryAd,
    fnAddBookToBookShelf,
    fnThrottle,
    fnDebounce,
}