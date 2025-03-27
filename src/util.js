import device from '@system.device';

/**
 * 显示菜单
 */
function showMenu(that,page) {
    const prompt = require('@system.prompt')
    const router = require('@system.router')
    const appInfo = require('@system.app').getInfo()
    page = page || '1'
    prompt.showContextMenu({
        itemList: ['添加至桌面', '关于', '取消'],
        success: function (ret) {
            switch (ret.index) {
            case 0:
                // 保存桌面
                createShortcut(that,'','','menu')
                that.$app.$def.quickappLog([702, {
                    qmap:{
                        site: '2',
                        page
                    }
                }, 'menu'], that)
                break
            case 1:
                // 关于
                router.push({
                    uri: '/About',
                    params: {
                        name: appInfo.name,
                        icon: appInfo.icon
                    }
                })
                that.$app.$def.quickappLog([702, {
                    qmap:{
                        site: '3',
                        page
                    }
                }, 'menu'], that)
                break
            case 2:
                // 取消
                that.$app.$def.quickappLog([702, {
                    qmap:{
                        site:'4',
                        page
                    }
                }, 'menu'], that)
                break
            default:
                that.$app.$def.quickappLog([703, {
                    qmap:{
                        site:'5',
                        page
                    }
                }, 'menu'], that)
            }
        }
    })
    that.$app.$def.quickappLog([703, {
        qmap:{
            site: '1',
            page
        }
    }, 'menu'], that)
}

/**
 * 创建桌面图标
 * 注意：使用加载器测试`创建桌面快捷方式`功能时，请先在`系统设置`中打开`应用加载器`的`桌面快捷方式`权限
 */
function createShortcut(that,page,msg,touch) {
    const prompt = require('@system.prompt')
    const shortcut = require('@system.shortcut')
    msg = msg || '将【'+that.$app.$data.name+'】添加到桌面，方便下次继续阅读！'
    page = page || '1';
    let _infotype = that.$app.dataJson.infotype || 'nfind';
    if(_infotype == 'shortcut'){
        // console.log('已创建桌面图标')
        that.$app.$def.quickappLog([703, {
            qmap:{
                site: '4',
                page,
                touch,
                sorce:'util_shortcut',
                sorce2:'_infotype'
            }
        }, 'shortcut'], that)
    }else{
        shortcut.hasInstalled({
            success: function (ret) {
                if (ret) {
                    // prompt.showToast({
                    //     message: '已创建桌面图标'
                    // })
                    that.$app.$def.quickappLog([703, {
                        qmap:{
                            site: '4',
                            page,
                            touch,
                            sorce:'util_shortcut'
                        }
                    }, 'shortcut'], that)
                } else {
                    shortcut.install({
                        message:msg,
                        success: function () {
                            that.$app.shenceLog.log(that, 'track', 'SaveToDesktop', {
                                IsSuccess: true,
                                PositionName: '右上角菜单添桌',
                                Instruction: msg,
                                StateCode: 'return'
                            }); 
                            //来源写入变量
                            that.$app.dataJson = Object.assign({}, {infotype:'shortcut'});
                            prompt.showToast({
                                message: '成功创建桌面图标'
                            })
                            that.$app.$def.quickappLog([703, {
                                qmap:{
                                    site: '2',
                                    page,
                                    touch,
                                    sorce:'util_shortcut'
                                }
                            }, 'shortcut'], that)
                            that.$app.$def.requestData(that,{
                                interface: `/glory/fastapp/2107`,
                                data: {
                                    isas:1
                                },
                                succ: function (res) {
                                    if(res.data.freeLimitAll){
                                        that.$app.shortSuccessText = res.data.freeLimitAll
                                    }
                                    that.showShortSuccess()
                                },
                                error: function (code) {
                                    that.showShortSuccess()
                                }
                            })
                            fnTellServer(that,1);
                        },
                        fail: function (data, code) {
                            that.$app.shenceLog.log(that, 'track', 'SaveToDesktop', {
                                IsSuccess: false,
                                PositionName: '右上角菜单添桌',
                                Instruction: msg,
                                StateCode: 'return',
                                MsgSendCode: code,
                                MsgSendContent: data,
                            }); 
                            prompt.showToast({
                                message: '创建桌面图标失败'
                            })
                            that.$app.$def.quickappLog([703, {
                                qmap:{
                                    site: '3',
                                    code,
                                    data,
                                    page,
                                    touch,
                                    sorce:'util_shortcut',
                                    source: 'shortcut_hasInstalled_fail',
                                    thisUri: that.$page.uri,
                                    thisPage: 'util.js'
                                }
                            }, 'catch_error'], that)
                        },
                        complete(errmsg){
                            that.$app.$def.quickappLog([703, {
                                qmap:{
                                    site: '5',
                                    errmsg:`${errmsg}`,
                                    page,
                                    touch,
                                    sorce:'util_shortcut'
                                }
                            }, 'shortcut'], that)

                        }
                    })
                    that.$app.shenceLog.log(that, 'track', 'SaveToDesktop', {
                        PositionName: '右上角菜单添桌',
                        Instruction: msg,
                        StateCode: 'submit',
                        DesktopState: that.$app.isAddDesktop ? 'Deleted' : 'Neversaved'
                    }); 
                    that.$app.$def.quickappLog([703, {
                        qmap:{
                            site: '1',
                            page,
                            touch,
                            sorce:'util_shortcut'
                        }
                    }, 'shortcut'], that)
                }
            }
        })
    }
    
}

/**
 * 退出快应用添加桌面
 */
function backShortcut(that) {
    const prompt = require('@system.prompt')
    const shortcut = require('@system.shortcut')
    let _infotype = that.$app.dataJson.infotype || 'nfind';
    if(_infotype == 'shortcut'){
        // console.log('已创建桌面图标')
        //退出快应用
        that.$app.$def.quickappLog([703, {
            qmap:{
                site: '4',
                sorce:'util_back_shortcut',
                sorce2:'_infotype'
            }
        }, 'shortcut'], that)
        // that.fnExitSwitch()
        that.$app.exit();
    }else{
        shortcut.hasInstalled({
            success: function (ret) {
                if (ret) {
                    // prompt.showToast({
                    //     message: '已创建桌面图标'
                    // })
                    //退出快应用
                    that.$app.$def.quickappLog([703, {
                        qmap:{
                            site: '4',
                            sorce:'util_back_shortcut'
                        }
                    }, 'shortcut'], that)
                    // that.fnExitSwitch()
                    that.$app.exit()
                } else {
                    shortcut.install({
                        message:'将【'+that.$app.$data.name+'】添加到桌面，方便下次继续阅读！',
                        success: function () {
                            that.$app.shenceLog.log(that, 'track', 'SaveToDesktop', {
                                IsSuccess: true,
                                PositionName: '退出快应用添桌',
                                Instruction: '将【' + that.$app.$data.name + '】添加到桌面，方便下次继续阅读！',
                                StateCode: 'return'
                            }); 
                            //来源写入变量
                            that.$app.dataJson = Object.assign({}, {infotype:'shortcut'});
                            prompt.showToast({
                                message: '成功创建桌面图标'
                            })
                            that.$app.$def.requestData(that,{
                                interface: `/glory/fastapp/2107`,
                                data: {
                                    isas:1
                                },
                                succ: function (data) {
                                },
                                error: function (code) {
                                }
                            })
                            //退出快应用
                            // that.$app.exit()
                            fnTellServer(that,1);
                            that.addShortcutHandle()
                        },
                        fail: function (data, code) {
                            that.$app.shenceLog.log(that, 'track', 'SaveToDesktop', {
                                IsSuccess: false,
                                PositionName: '退出快应用添桌',
                                Instruction: '将【' + that.$app.$data.name + '】添加到桌面，方便下次继续阅读！',
                                StateCode: 'return',
                                MsgSendCode: code,
                                MsgSendContent: data,
                            }); 
                            //退出快应用
                            that.$app.$def.quickappLog([703, {
                                qmap:{
                                    site: '3',
                                    data,
                                    code,
                                    sorce:'util_back_shortcut',
                                    source: 'shortcut_install_fail',
                                    thisUri: that.$page.uri,
                                    thisPage: 'util.js'
                                }
                            }, 'catch_error'], that)
                            // that.fnExitSwitch()
                            that.$app.exit()
                        },
                        complete(errmsg){
                            //退出快应用
                            that.$app.$def.quickappLog([703, {
                                qmap:{
                                    site: '5',
                                    errmsg:`${errmsg}`,
                                    sorce:'util_back_shortcut'
                                }
                            }, 'shortcut'], that)
                            // that.$app.exit()
                        }
                    })
                    that.$app.shenceLog.log(that, 'track', 'SaveToDesktop', {
                        PositionName: '退出快应用添桌',
                        Instruction: '将【' + that.$app.$data.name + '】添加到桌面，方便下次继续阅读！',
                        StateCode: 'submit',
                        DesktopState: that.$app.isAddDesktop ? 'Deleted' : 'Neversaved'
                    }); 
                    that.$app.$def.quickappLog([703, {
                        qmap:{
                            site: '1',
                            sorce:'util_back_shortcut'
                        }
                    }, 'shortcut'], that)
                }
            }
        })
    }
}

function fnTellServer(that,taskAction) {
    that.$app.$def.requestData(that,
        {
            interface: '/glory/fastapp/2146',
            data: { action: taskAction },
            succ: function (res) {
            }
        }
    )
}

function bindPageLC() {
    Function.prototype.bindPage = function(vmInst) {
        const fn = this
        return function() {
            if (!vmInst) {
                return
            }
            if (vmInst.$valid) {
                return fn.apply(vmInst, arguments)
            } else {
                console.info(`页面销毁，不执行回调函数`)
            }
        }
    }
}

bindPageLC()

// 获取设备信息
function getDeviceInfo() {
    return new Promise((resolve, reject) => {
        device.getInfo({
            success: (data) => {
                resolve(data)
            },
            fail: () => {
                reject()
            }
        })
    })
}

function getAndroidId() {
    return new Promise((resolve, reject) => {
        device.getUserId({
            success: (data) => {
                resolve(data.userId)
            },
            fail: () => {
                reject()
            }
        })
    })
}

function getOaid() {
    return new Promise((resolve, reject) => {
        device.getOAID({
            success: (data) => {
                resolve(data.oaid)
            },
            fail: () => {
                reject()
            }
        })
    })
}

function getLogTime(){
    var date = new Date();
    return date.getFullYear().toString() + pad2(date.getMonth() + 1) + pad2(date.getDate()) + pad2(date.getHours()) + pad2(date.getMinutes()) + pad2(date.getSeconds());
}
function pad2(n) { return n < 10 ? '0' + n : n }

// vivopush消息支持判断
function fnVivoPushSupport(that) {
    return that.$app && that.$app.headerJson && that.$app.headerJson.pfvc && that.$app.headerJson.pfvc >= 1091 && that.$app.headerJson.brand && that.$app.headerJson.brand.toLowerCase() == 'vivo'  
}
// vivopush消息
function fnVivoPush(that, location = '') {
    if(!location) {
        return
    }
    const prompt = require('@system.prompt')
    // 请求vivopush数据
    that.$app.$def.requestData(that, {
        interface: '/glory/fastapp/2804',
        data: { location: location },
        succ: function (res) {
            if (res.data && JSON.stringify(res.data) != '{}') {
                let vivoPushParams = res.data
                let params = {
                    templateIds: vivoPushParams.templateIds,
                    clientId: vivoPushParams.clientId + '',
                    userId: vivoPushParams.userId + '',
                    scene: vivoPushParams.scene + '',
                    subDesc: vivoPushParams.subDesc + '',
                    type: vivoPushParams.type + '',
                }
                that.$app.$def.fnReportVivoPush(that, location, vivoPushParams, '3', '')
                that.vivoPush.subscribe({
                    params: params,
                    success: function(res) {
                        that.$app.$def.fnReportVivoPush(that, location, vivoPushParams, '1', (res ? res : ''))
                        prompt.showToast({
                            message: '订阅成功'
                        })
                        that.$app.shenceLog.log(that, 'track', 'SubscribeR', {
                            TemplateIds: vivoPushParams.templateIds,
                            PositionName: location + '',
                            ShuntId: vivoPushParams.userTacticsVo ? vivoPushParams.userTacticsVo.shuntID : '',
                            ShuntName: vivoPushParams.userTacticsVo ? vivoPushParams.userTacticsVo.shuntName + '' : '',
                            SourceId: vivoPushParams.userTacticsVo ? vivoPushParams.userTacticsVo.sourceId : '',
                            SourceName: vivoPushParams.userTacticsVo ? vivoPushParams.userTacticsVo.sourceName + ''  : '',
                            TacticsId: vivoPushParams.userTacticsVo ? vivoPushParams.userTacticsVo.tacticsId : '',
                            TacticsName: vivoPushParams.userTacticsVo ? vivoPushParams.userTacticsVo.tacticsName + ''  : ''
                        });
                    },
                    fail: function(err) {
                        that.$app.$def.fnReportVivoPush(that, location, vivoPushParams, '2', (err ? err : ''))
                        prompt.showToast({
                            message: '订阅失败'
                        })
                    }
                })
                that.$app.shenceLog.log(that, 'track', 'Subscribe', {
                    TemplateIds: vivoPushParams.templateIds,
                    PositionName: location + '',
                    ShuntId: vivoPushParams.userTacticsVo ? vivoPushParams.userTacticsVo.shuntID : '',
                    ShuntName: vivoPushParams.userTacticsVo ? vivoPushParams.userTacticsVo.shuntName + '' : '',
                    SourceId: vivoPushParams.userTacticsVo ? vivoPushParams.userTacticsVo.sourceId : '',
                    SourceName: vivoPushParams.userTacticsVo ? vivoPushParams.userTacticsVo.sourceName + ''  : '',
                    TacticsId: vivoPushParams.userTacticsVo ? vivoPushParams.userTacticsVo.tacticsId : '',
                    TacticsName: vivoPushParams.userTacticsVo ? vivoPushParams.userTacticsVo.tacticsName + ''  : '',
                });
            }
        }
    })
}

//检查一键加桌是否可用
function fnCheckOnekeycutSup(that){
    const vivoSupport = that.$app && that.$app.headerJson && that.$app.headerJson.pfvc && that.$app.headerJson.pfvc >= 1092 && that.$app.headerJson.brand && that.$app.headerJson.brand.toLowerCase() == 'vivo'
    const oppoSupport = that.$app && that.$app.headerJson && that.$app.headerJson.pfvc && that.$app.headerJson.pfvc >= 1082 && that.$app.headerJson.brand && (that.$app.headerJson.brand.toLowerCase() == 'oppo' || that.$app.headerJson.brand.toLowerCase() == 'realme' || that.$app.headerJson.brand.toLowerCase() == 'oneplus')
    const huaweiSupport = that.$app && that.$app.headerJson && that.$app.headerJson.pfvc && that.$app.headerJson.pfvc >= 1081 && that.$app.headerJson.brand && (that.$app.headerJson.brand.toLowerCase() == 'huawei' || that.$app.headerJson.brand.toLowerCase() == 'honor')
    const cutSupport = { vivoSupport, oppoSupport, huaweiSupport }    
    return cutSupport
}

// vivopush消息上报
function fnReportVivoPush(that, location, vivoPushParams, type, msg = '') {
    try {
        if(msg && typeof msg == 'object') {
            msg = JSON.stringify(msg)
        }
    }catch(e) {}
    let allParams = vivoPushParams
    that.$app.$def.requestData(that, {
        interface: '/glory/fastapp/2805',
        data: {
            templateIds: allParams.templateIds,
            scene: allParams.scene,
            location: location, 
            type: type,
            msg: msg,
        },
        succ: function (res) {
            if (res && res.retCode == 0) {
                console.log('vivopush上报成功', type)
            }else {
                console.log('vivopush上报失败', type)
            }
        },
        error: function () {
            console.log('vivopush上报失败', type)
        }
    })
}

const Base64 = require('js-base64').Base64;
let _base64 = {}
_base64.encode = function(str,that){
    if(that.$app.swParam && that.$app.swParam==1){
        return Base64.encode(str)
    }else{
        return str
    }
}
_base64.decode = function(str){
    try {
        return Base64.decode(str)
    } catch (error) {
        return str
    }
}

const cipher = require('@system.cipher')
let rsa = {}
rsa.encrypt = function(str,that){
    return new Promise((res,rej)=>{
        if(that.$app.swParam && that.$app.swParam==2){
            cipher.rsa({
                action: 'encrypt',
                //待加密的文本内容
                text: str,
                //base64编码后的加密公钥
                key:'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAp52m6mU3eOyi25m/migywzrISsZaFPoQKlU4Du9NuXoPJyZ63KRzVjtSezshXDPqWxfaRYvwqjVp5VMohv/VLHuWBnQRZZY4bxcu+IcKnB08j7JDyO76t9Sdt1kh2XrFe4fUZmdxFcMBgibSdQ9NH3//XD+ZuFP+I923zR5EyC+/ZBaeRiDwom2BoR0LgmNeFb4zbMmPfGYb8fvMpSpcZjBCbKCuEhttULOsW+hGBiAL7dHK5xYEF74Fd8P79EYQ/QCgpI2TvaGndn/M7oakqsPKr4q1lMWGcx1DBlt3fBMydsGPy7eaE89YQZZ9IoAWgqPXeGuSanMhENHf8Lu/GwIDAQAB',
                transformation: 'RSA/ECB/OAEPPadding',
                success: function(data) {
                    console.log(`handling success: ${data.text}`)
                    res(data.text)
                },
                fail: function(data, code) {
                    console.log(`### cipher.rsa fail ### ${code}: ${data}`)
                    res()
                }
            })
        }else{
            res()
        }
    })
}
rsa.decrypt = function(str){
    return new Promise((res,rej)=>{
        cipher.rsa({
            action: 'decrypt',
            //待加密的文本内容
            text: str,
            //base64编码后的解密私钥
            key:'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCnnabqZTd47KLbmb+aKDLDOshKxloU+hAqVTgO7025eg8nJnrcpHNWO1J7OyFcM+pbF9pFi/CqNWnlUyiG/9Use5YGdBFlljhvFy74hwqcHTyPskPI7vq31J23WSHZesV7h9RmZ3EVwwGCJtJ1D00ff/9cP5m4U/4j3bfNHkTIL79kFp5GIPCibYGhHQuCY14VvjNsyY98Zhvx+8ylKlxmMEJsoK4SG21Qs6xb6EYGIAvt0crnFgQXvgV3w/v0RhD9AKCkjZO9oad2f8zuhqSqw8qvirWUxYZzHUMGW3d8EzJ2wY/Lt5oTz1hBln0igBaCo9d4a5JqcyEQ0d/wu78bAgMBAAECggEAYIPl/ihENexEpqC0dGbbPBGYDX6DlnqbXlTtz6O6JKgFG60LqAtFoozMJMtanUYDl2p3s/4tmUTicjtdJccgj9ml/JdPASjr3AQEdvUDhftLyQ6D+6qoUbwrCM1ZMWqBVm1TP5gmxLoiHziNjPw/k3jXqN2yfTJYL3zW/lSElKP+lPJWlEzeuRQqiXOj6DQi2BvGmgOuS/u6LhjN2kVVKxoI62wrey0fv/iNH5yByqyHHUwAEFKk5k4P4HXUYGMEh3SzKpARWD4zPNKZOHdpaynQ6a5y+trK3Yw7BUkWD1VR6hJTZ6xstzr1WUg2YD3dMmRnA7Lyogu/ddOru++ESQKBgQD8kP3gBqrV9HNPzM5iXZAEHRt0JiTfoyq8Ky74wiObh/GmuYhKbZRPYwmEi3Jk2QF9l6U/v/zkyC1/OWVxwhXjeOxhQ8hdJylGctp7ft8Wd6Gq2hKwwKLxwJo4z/RUeQbLa6PjjOESaApeKGclPDFBbwPb1APmUrwbFDeucwE4JwKBgQCp5QGkCatq+s31y5v3ZV3GQKJ8DMvF5DHCqIfrEsT7Rg453g5x4ShAuoUFOP6TuzJrnkxrDLRSBtsqTKF9fRCltT1cI7bykkRyHbQUUFDdvF4qzMUA7sURcu760Qul769XPAn7qBN+Rxtg0SMihYyP1utjjINAvTksfpJ2eK4F7QKBgQDf7cXJ7N9m11ettw59VCsuGoiO0Ir85XQsZbU9xRNBAKUWh4T5SHKoeEymAeUo2OZjbiKLhTM5vOnp1P/GfqhdiIc8LZbmUKRd29Muj2xIRUVHcBYGNKXD5lpWaLpecve9P/CM/glIAoq+tN/OubGKLF2leDME8PHqqGA+AaVhHQKBgEXnurMaX3QXWqOmcbhr9xfaBIFyam40pNzpp3NsN60EeFoLKnplIMDxfkZV2zpCLk7lxZ/OjGur8oYHHfOagD0Ow/6jm2VYFd22pyAso/l4xm5p7y2hEWlKl1aQqXBPnSARzjHESLEO5Q8DPqe3t8x/rD87083RjjLmqbEhmslJAoGBAMPQOW5h6vhiiQwu6cZQ8CVDTwDTkGs+D/ekwKiAoiPTxhSYANyx6xU0o7SqGbJ5fr4JzsOQ/Abc3FHzFA3Ozfw4n4AzPhviaQbwF19TJmIokX2Rw/ah+4AYrHl/jHePPmLSx5w9vJuM/iM7Tsw24qsqGO4d7SVQdnFuzkOl33KS',
            transformation: 'RSA/ECB/OAEPPadding',
            success: function(data) {
                console.log(`${data.text}`)
                res(data.text)
            },
            fail: function(data, code) {
                console.log(`### cipher.rsa fail ### ${code}: ${data}`)
                res()
            }
        })
    })
}

/**
 * 获取用户注册时间
 */
function fnGetCreateTime () {
    let _this = this
    return new Promise((res, rej) => {
        if(!_this.$app || !_this.$app.$def) {
            res(false)
            return
        }
        _this.$app.$def.getStorageFile(_this, {
            key: 'createTime',
            success: function(data) {
                if (data) {
                    res(+data)
                } else {
                    res(false)
                }
            },
            fail: function() {
                res(false)                               
            }
        })
    })
}

/**
 * 获取用户首次访问时间
 */
function fnGetInstallTime () {
    let _this = this
    return new Promise((res, rej) => {
        if(!_this.$app || !_this.$app.$def) {
            res(false)
            return
        }
        _this.$app.$def.getStorageFile(_this, {
            key: 'installationTime',
            success: function(data) {
                if (data) {
                    res(+data)
                } else {
                    res(false)
                }
            },
            fail: function() {
                res(false)                               
            }
        })
    })
}

/**
 * 获取当前时间 yyyymmdd
 */
function fnGetCurrentDate() {
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth()
    let day = date.getDate()
    let ret = year + '' + ((month + 1) >= 10 ? (month + 1) : '0' + (month + 1)) + '' + (day >= 10 ? day : '0' + day)
    return ret
}

export default {
    showMenu,
    createShortcut,
    backShortcut,
    getDeviceInfo,
    getAndroidId,
    getOaid,
    getLogTime,
    fnVivoPush,
    fnReportVivoPush,
    fnVivoPushSupport,
    fnCheckOnekeycutSup,
    _base64,
    rsa,
    fnGetCreateTime,
    fnGetInstallTime,
    fnGetCurrentDate
}
