function quickappLog(arr, that) {
    const fetch = require('@system.fetch')
    const storage = require('@system.storage')
    var logData
    if(arr[2] == 'serious_error') {
        logData = {
            tag: arr[0],
            event: arr[2],
            api: that.api,
            appVer: that.$app && that.$app.$data && that.$app.$data.appVer,
            domain: that.$app && that.$app.$data && that.$app.$data.domain,
            pname: that.$app && that.$app.$data && that.$app.$data.pname,
            name: that.$app && that.$app.$data && that.$app.$data.name,
            qmap: arr[1]['qmap'],
        }
        fetch.fetch({
            method: 'POST',
            url: 'https://kyylog.hzage.cn/kyylog.php',
            data: { json: JSON.stringify(logData) },
        })
        return
    }
    if(arr[2] == "onError" || arr[2] === 'smdid_too_long'){
        logData = {
            tag: arr[0],
            event:arr[2],
            api: that.api,
            appVer: that.$data.appVer,
            domain: that.$data.domain,
            pname: that.$data.pname,
            name: that.$data.name
        }
        for (var logkey in arr[1]) {
            logData[logkey] = arr[1][logkey]
        }
    }else{
        logData = {
            tag: arr[0],
            api: that.$app.api,
            appVer: that.$app.$data.appVer,
            domain: that.$app.$data.domain,
            pname: that.$app.$data.pname,
            name: that.$app.$data.name,
            uri: that.$page.uri,
            path: that.$page.path,
            component: that.$page.component,
            channelCodeFee: '',
            channelCode: '',
            brand: '',
            model: '',
            osvn:'',
            osvc:'',
            scw:'',
            sch:'',
            pfvn:'',
            pfvc:'',
            utdid: '',
            userId: '',
            uuid:'',
            t: ''
        }
        if (logData.tag == 702) {
            logData['zone'] = arr[2]
        }
        if (logData.tag == 703) {
            logData['event'] = arr[2]
        }
        for (var onelogkey in arr[1]) {
            logData[onelogkey] = arr[1][onelogkey]
        }
    }
    let oPersonInfo = new Promise((resolve,reject) => {
        that.$app.$def.getStorageFile(that,{
            key:'headerJson',
            success:function(data){
                if(data){
                    // reject(data);
                    resolve(data);
                }else{
                    reject(data);
                }
            },
            fail:function(data, code){
                reject(data);
                
            }
        })
        // storage.get({
        //     key: 'headerJson',
        //     complete: function (data) {
        //         resolve(data)
        //     }
        // })
    })
    let oInstallationTime = new Promise((resolve,reject)=>{
        that.$app.$def.getStorageFile(that,{
            key:'installationTime',
            success:function(data){
                if(data){
                    resolve(data);
                }else{
                    reject(data);
                }
            },
            fail:function(data, code){
                reject(data);
            }
        })
        // storage.get({
        //     key: 'installationTime',
        //     complete: function (data) {
        //         resolve(data)
        //     }
        // })
    })
    Promise.all([oPersonInfo,oInstallationTime]).then(result=>{
        if (result[0]) {
            let json = JSON.parse(result[0])
            logData.channelCodeFee = json.channelCodeFee
            logData.channelCode = json.channelCode
            logData.brand = json.brand
            logData.model = json.model
            logData.utdid = json.utdid
            logData.utdidTmp = json.utdidTmp
            logData.userId = json.userId
            logData.uuid = json.uuid
            logData.t = json.t
            logData.osvn = json.osvn
            logData.osvc = json.osvc
            logData.scw = json.scw
            logData.sch = json.sch
            logData.pfvn = json.pfvn
            logData.pfvc = json.pfvc
        }
        if(result[1]){
            let oTime = new Date().getTime();
            let oDistance = Math.floor((oTime-result[1])/1000/3600);
            logData.installationTime = `${oDistance} hours`;
        }
        fetch.fetch({
            method: 'POST',
            url: 'https://kyylog.hzage.cn/kyylog.php',
            data: { json: JSON.stringify(logData) },
            success: function (ret) {
            },
            fail: function (data,code) {
                
            },
            complete:function(ret){
            }
        })
    }).catch((error) => {
        logData.error = error;
        fetch.fetch({
            method: 'POST',
            url: 'https://kyylog.hzage.cn/kyylog.php',
            data: { json: JSON.stringify(logData) },
            success: function (ret) {
            },
            fail: function (data, code) {
                
            }
        })
    })
}
// 第三方京东使用的打点
function kyyerrorlog(arr, that) {
    const fetch = require('@system.fetch')
    const storage = require('@system.storage')
    var logData
    if(arr[2] == "onError"){
        logData = {
            tag: arr[0],
            event:arr[2],
            api: that.api,
            appVer: that.$data.appVer,
            domain: that.$data.domain,
            pname: that.$data.pname,
            name: that.$data.name
        }
        for (var logkey in arr[1]) {
            logData[logkey] = arr[1][logkey]
        }
    }else{
        logData = {
            tag: arr[0],
            api: that.$app.api,
            appVer: that.$app.$data.appVer,
            domain: that.$app.$data.domain,
            pname: that.$app.$data.pname,
            name: that.$app.$data.name,
            uri: that.$page.uri,
            path: that.$page.path,
            component: that.$page.component,
            channelCodeFee: '',
            channelCode: '',
            brand: '',
            model: '',
            osvn:'',
            osvc:'',
            scw:'',
            sch:'',
            pfvn:'',
            pfvc:'',
            utdid: '',
            userId: '',
            uuid:'',
            t: ''
        }
        if (logData.tag == 702) {
            logData['zone'] = arr[2]
        }
        if (logData.tag == 703) {
            logData['event'] = arr[2]
        }
        for (var onelogkey in arr[1]) {
            logData[onelogkey] = arr[1][onelogkey]
        }
    }
    let oPersonInfo = new Promise((resolve,reject) => {
        that.$app.$def.getStorageFile(that,{
            key:'headerJson',
            success:function(data){
                if(data){
                    // reject(data);
                    resolve(data);
                }else{
                    reject(data);
                }
            },
            fail:function(data, code){
                reject(data);
                
            }
        })
        // storage.get({
        //     key: 'headerJson',
        //     complete: function (data) {
        //         resolve(data)
        //     }
        // })
    })
    let oInstallationTime = new Promise((resolve,reject)=>{
        that.$app.$def.getStorageFile(that,{
            key:'installationTime',
            success:function(data){
                if(data){
                    resolve(data);
                }else{
                    reject(data);
                }
            },
            fail:function(data, code){
                reject(data);
            }
        })
        // storage.get({
        //     key: 'installationTime',
        //     complete: function (data) {
        //         resolve(data)
        //     }
        // })
    })
    Promise.all([oPersonInfo,oInstallationTime]).then(result=>{
        if (result[0]) {
            let json = JSON.parse(result[0])
            logData.channelCodeFee = json.channelCodeFee
            logData.channelCode = json.channelCode
            logData.brand = json.brand
            logData.model = json.model
            logData.utdid = json.utdid
            logData.utdidTmp = json.utdidTmp
            logData.userId = json.userId
            logData.uuid = json.uuid
            logData.t = json.t
            logData.osvn = json.osvn
            logData.osvc = json.osvc
            logData.scw = json.scw
            logData.sch = json.sch
            logData.pfvn = json.pfvn
            logData.pfvc = json.pfvc
        }
        if(result[1]){
            let oTime = new Date().getTime();
            let oDistance = Math.floor((oTime-result[1])/1000/3600);
            logData.installationTime = `${oDistance} hours`;
        }
        fetch.fetch({
            method: 'POST',
            url: 'https://kyylog.hzage.cn/kyyerrorlog.php',
            data: { json: JSON.stringify(logData) },
            success: function (ret) {
            },
            fail: function (data,code) {
                
            },
            complete:function(ret){
            }
        })
    }).catch((error) => {
        logData.error = error;
        fetch.fetch({
            method: 'POST',
            url: 'https://kyylog.hzage.cn/kyyerrorlog.php',
            data: { json: JSON.stringify(logData) },
            success: function (ret) {
            },
            fail: function (data, code) {
                
            }
        })
    })
}
export default {
    quickappLog,
    kyyerrorlog
}
//this.$app.$def.quickappLog([701], this); pv
//this.$app.$def.quickappLog([702,{map},zone], this);  click
//this.$app.$def.quickappLog([703,{map},event], this); 回调

// tag: pv:701  click:702  回调：703
// api: 接口
// appVer: 版本号
// domain: 域
// pname: 包名
// name: 应用名
// uri: 页面地址
// path: 页面路径
// component: 组件名字
// channelCodeFee: 渠道号
// channelCode: 渠道号
// brand: 设备品牌
// model: 设备型号
// utdid: 用户唯一标识
// userId: 用户id
// t: 用户token