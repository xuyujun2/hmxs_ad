const fetch = require('@system.fetch');
const app = require('@system.app');

import log from './log.js';
import SM_SDK from './fp.js';
import SM_SDK_CONF from './fp-config.js';

export default function fnSmInit() {
    if (!this || this.name !== 'app') {
        console.error('---数美初始化方法调用出错，上下文对象应为$app---');
        return false;
    }
    let that = this;
    that.isSmSDKCreated = false;                                                // 数美SDK是否已经创建
    that.smFlag = {
        smRegisterUpFlag: false,                                                // 注册上报开关
        smNativeAdUpFlag: false,                                                // 信息流上报开关
        smSplashAdUpFlag: false,                                                // 开屏上报开关
        smInterstitialAdUpFlag: false,                                          // 插页上报开关
        smRewardedVideoAdUpFlag: false,                                         // 激励视频上报开关
    }
    const KEY_OF_FLAG = {                                                       // 数美事件上报开关map，和that.smFlag对应
        register: 'smRegisterUpFlag',
        NATIVE_AD: 'smNativeAdUpFlag',
        SPLASH_AD: 'smSplashAdUpFlag',
        INTERSTITIAL_IMAGE_AD: 'smInterstitialAdUpFlag',
        REWARDED_VIDEO_AD: 'smRewardedVideoAdUpFlag',
    }

    // 数美SDK创建
    that.fnSmSDKCreate = function () {
        if (that.isSmSDKCreated) {
            return false;
        }
        try {
            SM_SDK.Create(SM_SDK_CONF);
        } catch (err) {
            return false;
        }
        console.log('---数美SDK创建成功---');
        that.isSmSDKCreated = true;
        if (that.isNewUser && that.smFlag.smRegisterUpFlag) {
            setTimeout(() => {
                that.fnSmReportRegister(that.headerJson.userId);                // 上报注册事件
            }, 2000);
        }
    }

    /**
     * 数美开关初始化
     * @param   {Object}    config      [接口下发开关数据]
    */
    that.fnSmFlagInit = function (config) {
        if (!config || typeof config !== 'object') {
            return false;
        }
        for (let key in that.smFlag) {
            that.smFlag[key] = !!config[key];
        }
    }

    /**
     * 获取数美事件上报开关
     * @param   {String}    adType      [事件类型]
    */
    that.getSmFlag = function (key) {
        if (!key) {
            console.error('---获取数美开关key为必传参数---');
            return false;
        }
        let flagKey = KEY_OF_FLAG[key];
        if (!flagKey) {
            return false;
        }
        return !!that.smFlag[flagKey];
    }

    /**
     * 数美SDK获取设备标识
     * 数美采集完设备信息，和服务端生成的设备标识为B开头，长度为89位
     * 只采集完设备信息，未和数美服务器生成设备标识时为boxData，D开头，长度不固定，一般在10KB内
     */
    that.fnGetSmdid = function () {
        if (!that.isSmSDKCreated) {
            return '';
        }
        if (!SM_SDK || typeof SM_SDK.getDeviceId !== 'function') {
            return '';
        }
        let deviceId = SM_SDK.getDeviceId();
        if (!deviceId || typeof deviceId !== 'string') {
            return '';
        }
        if (deviceId.length > 89) {
            log.quickappLog([703, {}, 'smdid_too_long'], that);
            return '';
        }
        return deviceId;
    }

    /**
     * 数美SDK事件上报
     * @param   {String}    eventId     [事件类型]
     * @param   {Object}    data        [其他参数]
    */
    that.fnSmReport = function (eventId, data) {
        if (!that.isSmSDKCreated) {
            return false;
        }
        let requestParam = {
            accessKey: 'f2R7yf9zXrz29dajtmQB',
            appId: 'default',
            eventId,                                                                        // 事件类型
            data: {
                ip: '',                                                                     // IP
                os: 'android',                                                              // 操作系统类型
                isTokenSeperate: 0,                                                         // 是否区分账号体系
                timestamp: Date.now(),                                                      // 时间戳
                deviceId: that.fnGetSmdid(),                                                // 设备标识
                tokenId: that.headerJson.userId,                                            // 用户标识
                appVersion: app.getInfo().versionName,                                      // 应用版本号
            }
        }
        if (data && Object.prototype.toString.call(data).slice(8, -1) === 'Object') {
            requestParam.data = Object.assign(requestParam.data, data);
        }
        fetch.fetch({
            method: "POST",
            url: 'http://api-skynet-bj.fengkongcloud.com/v4/event',
            header: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            data: requestParam,
            success: function (res) {
                // console.log('---数美上报结果---', res);
            },
            fail: function () {}
        });
    }

    /**
     * 数美注册事件上报
     * @param   {String}       userId       [用户id]
    */
    that.fnSmReportRegister = function (userId) {
        if (!userId) {
            return false;
        }
        let data = {
            type: 'signupPlatform',
            guestId: userId
        }
        that.fnSmReport('register', data);
    }
}