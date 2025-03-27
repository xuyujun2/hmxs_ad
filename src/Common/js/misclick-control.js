/**
 * 误触频次控制
*/

import storage from '@system.storage';

export default function fnMisclickControlInit() {
    if (!this || this.name !== 'app') {
        console.error('---误触频次控制初始化方法调用出错，上下文对象应为$app---');
        return false;
    }
    let that = this;
    that.misclickConf = {                           // 误触频次配置信息
        switch: false,                              // 总开关，总频次 或者 任意一个位置配置了频次控制，开关为true
        maxCount: 0,                                // 总频次限制
        currentCount: 0,                            // 当前误触次数
        adPositionMaxCount: {                       // 各广告位置的频次限制
            open: 0,                                // 冷启动开屏
            hotOpen: 0,                             // 热启动开屏
            readOpen: 0,                            // 阅读页开屏
            readPre: 0,                             // 阅读页章首
            readTop: 0,                             // 阅读页顶部
            readMiddle: 0,                          // 阅读页中部
            readBanner: 0,                          // 阅读页底部
            readInsert: 0,                          // 阅读页插页
            readBack: 0,                            // 阅读页退出弹窗
            rewardMessage: 0,                       // 阅读奖励信息流
            infoMessage: 0,                         // 任务提示信息流
            adWallLocal: 0,                         // 激励墙
            popMessage: 0,                          // 首页弹窗
            indexBack: 0,                           // 首页退出弹窗
        },
        adPositionCurrentCount: {                   // 当前各位置误触的次数
            open: 0,                                // 冷启动开屏
            hotOpen: 0,                             // 热启动开屏
            readOpen: 0,                            // 阅读页开屏
            readPre: 0,                             // 阅读页章首
            readTop: 0,                             // 阅读页顶部
            readMiddle: 0,                          // 阅读页中部
            readBanner: 0,                          // 阅读页底部
            readInsert: 0,                          // 阅读页插页
            readBack: 0,                            // 阅读页退出弹窗
            rewardMessage: 0,                       // 阅读奖励信息流
            infoMessage: 0,                         // 任务提示信息流
            adWallLocal: 0,                         // 激励墙
            popMessage: 0,                          // 首页弹窗
            indexBack: 0,                           // 首页退出弹窗
        },
        timeInterval: 0,                            // 时间间隔
        lastTime: 0,                                // 上次误触时间
        timestamp: 0,                               // 当前误触次数的时间，用来判断当前累计的误触次数是否过期
    }
    that.clickedAdList = {                          // 已经点击过的广告素材缓存
        timestamp: '',
        titles: [],
        descriptions: []
    }
    /**
     * 设置误触配置
     * @param   {Object}    config      [误触配置]  
    */
    that.fnSetMisclickConf = config => {
        let maxCount = config.misClickTotalFrequency || 0;                              // 误触总频次限制
        let adPositionMaxCount = config.misClickAdPosition;                             // 各广告位置误触频次限制
        let timeInterval = (config.misClickIntervalTime || 0) * 1000;                   // 误触时间间隔(秒)
        let misclickSwitch = !!maxCount;                                                // 误触频次开关 - 总频次 或者 任意一个位置配置了频次控制，开关为true
        that.misclickConf.maxCount = maxCount;                                          // 设置总误触频次
        if (adPositionMaxCount) {
            for (let key in that.misclickConf.adPositionMaxCount) {
                let value = adPositionMaxCount[key] || 0;                               // 各位置误触频次限制
                if (!misclickSwitch && value) {
                    misclickSwitch = true;
                }
                that.misclickConf.adPositionMaxCount[key] = value;                      // 设置各广告位置频次
            }
        }
        that.misclickConf.timeInterval = timeInterval;                                  // 误触时间间隔(秒)
        that.misclickConf.switch = misclickSwitch;                                      // 设置误触频次总开关
    }
    /**
     * 是否取消误触，是否达到频次限制
     * @param   {Object}    ad          [广告信息]
     * @param   {String}    adPosition  [广告位置]
     * @return  {Object}                [result: 是否取消误触，msg: 描述信息]
    */
    that.fnIsCancelMisclick = (ad, adPosition) => {
        if (!ad || !adPosition) {
            return {
                result: false,
                msg: '参数错误，误触生效'
            }
        }
        if (!that.misclickConf.switch) {                                                // 没有下发误触频次限制
            return {
                result: false,
                msg: '频次限制开关未开启，误触生效'
            }
        }
        if (that.fnCheckAdHasClick(ad)) {                                               // 先判断相同广告今天有没有点击过。如果点击过，不触发误触
            return {
                result: true,
                msg: '该广告已经点击过，误触不生效'
            }
        }
        let isExpired = that.fnCheckMisclickCountExpire();                              // 校验当前误触次数是否过期
        if (isExpired) {
            that.fnUpdateMisclickCountToStorage();                                      // 更新当前误触次数至storage
        }
        let {
            lastTime,                                                                   // 上次误触时间
            timeInterval,                                                               // 时间间隔限制
            maxCount,                                                                   // 总误触频次限制
            currentCount,                                                               // 当前误触次数
            adPositionMaxCount,                                                         // 各广告位置的误触频次限制
            adPositionCurrentCount,                                                     // 各广告位当前误触频次
        } = that.misclickConf;
        
        if (lastTime && timeInterval && Date.now() - lastTime < timeInterval) {         // 未达到时间间隔，不触发误触
            return {
                result: true,
                msg: '时间间隔未到达，误触不生效'
            }
        }
        if (maxCount && currentCount >= maxCount) {                                     // 总误触频次超出，不触发误触
            return {
                result: true,
                msg: '总频次超出，误触不生效'
            }
        }
        let adPositionMax = adPositionMaxCount[adPosition],                             // 该广告位置的误触频次限制
            adPositionCurrent = adPositionCurrentCount[adPosition];                     // 该广告位置已经误触的次数
        if (adPositionMax && adPositionCurrent >= adPositionMax) {                      // 该广告位置的误触频次限制超出，不触发误触
            return {
                result: true,
                msg: '该广告位置频次超出，误触不生效'
            }
        }
        return {
            result: false,
            msg: '未达到频次限制，误触生效'
        }
    }
    /**
     * 校验广告是否点击过
     * @param   {Object}    ad      [广告信息]
    */
    that.fnCheckAdHasClick = ad => {
        let isExpired = that.fnCheckClickedAdListExpire();                              // 校验已点击广告列表是否过期
        if (isExpired) {
            that.fnUpdateClickedAdListToStorage();                                      // 如果已过期，更新storage存储
        }
        let {
            title,
            description
        } = ad;
        let {
            titles,
            descriptions
        } = that.clickedAdList;
        if (title && titles.indexOf(title) > -1 || description && descriptions.indexOf(description) > -1) {
            return true;                                                                // 标题和描述任意一个相同，认为同一支广告今天点击过
        }
        return false;
    }
    /**
     * 校验已点击广告列表是否过期
    */
    that.fnCheckClickedAdListExpire = () => {
        let {
            timestamp,
        } = that.clickedAdList;
        if (!timestamp) {
            that.clickedAdList.timestamp = Date.now();
            return false;
        }
        let now = new Date(),
            times = new Date(timestamp);
        if (now.getFullYear() === times.getFullYear() && now.getMonth() === times.getMonth() && now.getDate() === times.getDate()) {    // 年月日相等，未过期
            return false;
        }
        that.clickedAdList = {                                                          // 清空已经点击过的广告素材缓存
            timestamp: now.getTime(),
            titles: [],
            descriptions: []
        }
        return true;
    }
    /**
     * 校验当前误触次数是否已过期
    */
     that.fnCheckMisclickCountExpire = () => {
        let {
            timestamp,
        } = that.misclickConf;
        if (!timestamp) {
            that.misclickConf.timestamp = Date.now();
            return false;
        }
        let now = new Date(),
            times = new Date(timestamp);
        if (now.getFullYear() === times.getFullYear() && now.getMonth() === times.getMonth() && now.getDate() === times.getDate()) {    // 年月日相等，未过期
            return false;
        }
        that.misclickConf.lastTime = 0;                                                 // 重置上次误触时间
        that.misclickConf.timestamp = Date.now();
        that.misclickConf.currentCount = 0;                                             // 重置当前误触总次数
        for (let key in that.misclickConf.adPositionCurrentCount) {
            that.misclickConf.adPositionCurrentCount[key] = 0;                          // 重置各广告位置当前误触次数
        }
        return true;
    }
    /**
     * 广告点击时，存储物料信息 && 存储当前误触次数
     * @param   {Object}    ad              [广告信息]
     * @param   {Boolean}   isMisclick      [是否误触]
     * @param   {String}    adPosition      [广告位置]
    */
    that.fnSaveClickedAd = (ad, isMisclick, adPosition) => {
        if (!ad || typeof isMisclick !== 'boolean' || !adPosition) {
            return false;
        }
        if (!that.misclickConf.switch) {
            return false;
        }
        let isExpired = that.fnCheckClickedAdListExpire();                              // 校验已点击广告列表是否过期
        let needUpdateStorage = false;                                                  // 是否需要更新storage
        let {
            title,
            description
        } = ad;
        let {
            titles,
            descriptions
        } = that.clickedAdList;
        if (title && titles.indexOf(title) === -1) {
            titles.push(title);
            needUpdateStorage = true;
        }
        if (description && descriptions.indexOf(description) === -1) {
            descriptions.push(description);
            needUpdateStorage = true;
        }
        if (isExpired || needUpdateStorage) {
            that.fnUpdateClickedAdListToStorage();                                      // 更新已点击广告素材列表至storage
        }

        if (isMisclick) {                                                               // 误触
            that.fnCheckMisclickCountExpire();                                          // 校验当前误触次数是否过期
            that.misclickConf.lastTime = Date.now();                                    // 更新上次误触时间
            that.misclickConf.currentCount ++;                                          // 更新当前误触总次数
            that.misclickConf.adPositionCurrentCount[adPosition] ++;                    // 更新该广告位置的误触次数
            that.fnUpdateMisclickCountToStorage();                                      // 更新当前误触频次至storage
        }
    }
    /**
     * 更新已点击广告列表至storage
    */
    that.fnUpdateClickedAdListToStorage = () => {
        let adList = JSON.stringify(that.clickedAdList);
        storage.set({
            key: 'misclickAdList',
            value: adList,
            success: function () {},
            fail: function () {}
        });
    }
    /**
     * 获取storage中的已点击广告列表
    */
    that.fnGetClickedAdListFromStorage = () => {
        storage.get({
            key: 'misclickAdList',
            success: function (data) {
                if (data) {
                    try {
                        let obj = JSON.parse(data);
                        if (obj && obj.timestamp) {
                            that.clickedAdList = obj;
                        }
                    } catch (err) {}
                }
            },
            fail: function () {}
        });
    }
    that.fnGetClickedAdListFromStorage();

    /**
     * 更新当前误触频次至storage
    */
    that.fnUpdateMisclickCountToStorage = () => {
        let obj = {
            lastTime: that.misclickConf.lastTime,                                       // 上次误触时间
            timestamp: that.misclickConf.timestamp,
            currentCount: that.misclickConf.currentCount,                               // 当前误触总次数
            adPositionCurrentCount: that.misclickConf.adPositionCurrentCount,           // 各广告位置当前误触次数
        }
        storage.set({
            key: 'misclickCount',
            value: JSON.stringify(obj),
            success: function () {},
            fail: function () {}
        });
    }
    /**
     * 获取storage中的当前误触频次
    */
    that.fnGetMisClickCountFromStorage = () => {
        storage.get({
            key: 'misclickCount',
            success: function (data) {
                if (data) {
                    try {
                        let obj = JSON.parse(data) || {};
                        if (obj.lastTime) {                                             // 上次误触时间
                            that.misclickConf.lastTime = obj.lastTime;
                        }
                        if (obj.currentCount) {                                         // 当前误触总次数
                            that.misclickConf.currentCount = obj.currentCount;
                        }
                        if (obj.adPositionCurrentCount) {                               // 各广告位置当前误触次数
                            that.misclickConf.adPositionCurrentCount = obj.adPositionCurrentCount;
                        }
                        if (obj.timestamp) {
                            that.misclickConf.timestamp = obj.timestamp;
                        }
                    } catch (err) {}
                }
            },
            fail: function () {}
        });
    }
    that.fnGetMisClickCountFromStorage();
}