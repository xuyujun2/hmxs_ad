/**
 * 广告点击区域方法
*/
export default function AdClickCoordinates(app) {
    app.adClickCoordinatesInstance = this;
    const _self = this;
    _self.currentScreenWidth = 750;
    _self.currentScreenHeight = 0;
    //  广告区域配置信息
    _self.adAreaInfo = {
        'message': { adAreaWidth: 690, adAreaHeight: 202, btnWidth: 200, btnHeight: 44, btnToAdLeftMin: 570, btnToAdLeftMax: 628, btnToAdTopMin: 138, btnToAdTopMax: 182 },                                       // 竖版翻章方式阅读页广告                               
        'pre': { adAreaWidth: 710, adAreaHeight: 696, btnWidth: 566, btnHeight: 80, btnToAdLeftMin: 72, btnToAdLeftMax: 628, btnToAdTopMin: 616, btnToAdTopMax: 696 },                                            // 章首广告
        'insert': { adAreaWidth: 710, adAreaHeight: 736, btnWidth: 566, btnHeight: 80, btnToAdLeftMin: 72, btnToAdLeftMax: 628, btnToAdTopMin: 656, btnToAdTopMax: 736 },                                         // 插页广告
        'banner':  { adAreaWidth: 750, adAreaHeight: 146, btnWidth: 158, btnHeight: 64, btnToAdLeftMin: 572, btnToAdLeftMax: 730, btnToAdTopMin: 41, btnToAdTopMax: 105 },                                        // 阅读页底部
        'tip': { adAreaWidth: 640, adAreaHeight: 360 , btnWidth: 0, btnHeight: 0, btnToAdLeftMin: 0, btnToAdLeftMax: 0, btnToAdTopMin: 0, btnToAdTopMax: 0 },                                                     // 任务完成提示信息流
        'reward': { adAreaWidth: 580, adAreaHeight: 326,  btnWidth: 0, btnHeight: 0, btnToAdLeftMin: 0, btnToAdLeftMax: 0, btnToAdTopMin: 0, btnToAdTopMax: 0 },                                                  // 阅读奖励信息流
        'open': { adAreaWidth: 750, adAreaHeight: 858, btnWidth: 566, btnHeight: 80, btnToAdLeftMin: 92, btnToAdLeftMax: 658, btnToAdTopMin: 754, btnToAdTopMax: 834 },                                           // 开屏广告
        'pop': { adAreaWidth: 524, adAreaHeight: 932, btnWidth: 482, btnHeight: 80, btnToAdLeftMin: 71, btnToAdLeftMax: 553, btnToAdTopMin: 852, btnToAdTopMax: 932 },                                            // 首页弹窗
        'back': { adAreaWidth: 646, adAreaHeight: 752, btnWidth: 260, btnHeight: 80, btnToAdLeftMin: 333, btnToAdLeftMax: 593, btnToAdTopMin: 636, btnToAdTopMax: 716 }                                           // 退出广告
    }
    //  获取广告点击信息方法集合
    _self.adSizeInfo = {
        message(adInfo) {
            const { adAlias, adType } = adInfo;
            const { currentScreenWidth, currentScreenHeight, adAreaInfo } = _self;
            let { adAreaWidth, adAreaHeight, btnHeight, btnToAdLeftMin: minX, btnToAdLeftMax: maxX, btnToAdTopMin: minY, btnToAdTopMax: maxY } = adAreaInfo[adType];
            const left = Math.trunc((currentScreenWidth - adAreaWidth) / 2);
            const top = Math.trunc((currentScreenHeight - adAreaHeight) / 2);
            if (adAlias == 'readMiddle') {
                adAreaHeight = 529;
            }
            minY = adAreaHeight - 20 - btnHeight;
            maxY = minY + btnHeight;
            return {
                adAreaWidth,
                adAreaHeight,
                left,
                top,
                minX,
                maxX,
                minY,
                maxY
            }
        },
        pre(adInfo) {
            const { adHeight, adType } = adInfo;
            const { currentScreenWidth, currentScreenHeight, adAreaInfo } = _self;
            let { adAreaWidth, adAreaHeight, btnHeight, btnToAdLeftMin: minX, btnToAdLeftMax: maxX, btnToAdTopMin: minY, btnToAdTopMax: maxY } = adAreaInfo[adType];
            const isPro = adHeight && adHeight > 1250;
            adAreaHeight = isPro ? 781 : adAreaHeight;
            const left = Math.trunc((currentScreenWidth - adAreaWidth) / 2);
            const top = Math.trunc(currentScreenHeight - (42 + 146 + 140) - adAreaHeight);
            minY = adAreaHeight - 25;
            maxY = minY + btnHeight;
            return {
                adAreaWidth,
                adAreaHeight,
                top,
                left,
                minX,
                minY,
                maxX,
                maxY
            }
        },
        insert(adInfo) {
            const { insertHeight, adType } = adInfo;
            const { currentScreenWidth, currentScreenHeight, adAreaInfo } = _self;
            let { adAreaWidth, adAreaHeight, btnHeight, btnToAdLeftMin: minX, btnToAdLeftMax: maxX, btnToAdTopMin: minY, btnToAdTopMax: maxY } = adAreaInfo[adType];
            adAreaHeight = insertHeight;
            const extraAreaHeight = currentScreenHeight - (42 + 146 + 140) - adAreaHeight - 90 - 60;
            const left = Math.trunc((currentScreenWidth - adAreaWidth) / 2);
            const top = Math.trunc(extraAreaHeight / 2 + 90 + 60);
            minY = adAreaHeight - btnHeight;
            maxY = minY + btnHeight;
            return {
                adAreaWidth,
                adAreaHeight,
                left,
                top,
                minX,
                minY,
                maxX,
                maxY
            }
        },
        banner(adInfo) {
            const { adType } = adInfo;
            const { currentScreenWidth, currentScreenHeight, adAreaInfo } = _self;
            let { adAreaWidth, adAreaHeight, btnToAdLeftMin: minX, btnToAdLeftMax: maxX, btnToAdTopMin: minY, btnToAdTopMax: maxY } = adAreaInfo[adType];
            const left = Math.trunc(currentScreenWidth - adAreaWidth);
            const top = Math.trunc(currentScreenHeight - adAreaHeight);
            return {
                adAreaWidth,
                adAreaHeight,
                left,
                top,
                minX,
                maxX,
                minY,
                maxY
            }
        },
        tip(adInfo) {
            const { adType } = adInfo;
            const { currentScreenWidth, currentScreenHeight, adAreaInfo } = _self;
            let { adAreaWidth, adAreaHeight, btnToAdLeftMin: minX, btnToAdLeftMax: maxX, btnToAdTopMin: minY, btnToAdTopMax: maxY } = adAreaInfo[adType];
            const left = Math.trunc((currentScreenWidth - adAreaWidth) / 2);
            const top = Math.trunc((currentScreenHeight - adAreaHeight - 401) / 2) + 401;
            minX = 0;
            maxX = adAreaWidth;
            minY = 0;
            maxY = adAreaHeight;
            return {
                adAreaWidth,
                adAreaHeight,
                left,
                top,
                minX,
                maxX,
                minY,
                maxY
            }
        },
        reward(adInfo) {
            const { adType } = adInfo;
            const { currentScreenWidth, currentScreenHeight, adAreaInfo } = _self;
            let { adAreaWidth, adAreaHeight, btnToAdLeftMin: minX, btnToAdLeftMax: maxX, btnToAdTopMin: minY, btnToAdTopMax: maxY } = adAreaInfo[adType];
            const left = Math.trunc((currentScreenWidth - adAreaWidth) / 2);
            const top = Math.trunc((currentScreenHeight - 643 - 326) / 2) + 643;
            minX = 0;
            maxX = adAreaWidth;
            minY = 0;
            maxY = adAreaHeight;
            return {
                adAreaWidth,
                adAreaHeight,
                left,
                top,
                minX,
                maxX,
                minY,
                maxY
            }
        },
        open(adInfo) {
            const { adType, isNewOpenStyle } = adInfo;
            const { currentScreenWidth, currentScreenHeight, adAreaInfo } = _self;
            let { adAreaWidth, adAreaHeight, btnWidth, btnHeight, btnToAdLeftMin: minX, btnToAdLeftMax: maxX, btnToAdTopMin: minY, btnToAdTopMax: maxY } = adAreaInfo[adType];
            let top;
            top = Math.trunc((currentScreenHeight - adAreaHeight - 200) / 2);
            if (isNewOpenStyle) {
                adAreaWidth = 617;
                adAreaHeight = 1096;
                btnHeight = 90
                minX = Math.trunc((adAreaWidth - btnWidth) / 2);
                maxX = minX + btnWidth;
                minY = adAreaHeight - 247;
                maxY = minY + btnHeight;
                top = Math.trunc((currentScreenHeight - adAreaHeight ) / 2);
            } 
            const left = Math.trunc((currentScreenWidth - adAreaWidth) / 2);
            return {
                adAreaWidth,
                adAreaHeight,
                left,
                top,
                minX,
                minY,
                maxX,
                maxY
            }

        },
        pop(adInfo) {
            const { adType } = adInfo;
            const { currentScreenWidth, currentScreenHeight, adAreaInfo } = _self;
            let { adAreaWidth, adAreaHeight, btnToAdLeftMin: minX, btnToAdLeftMax: maxX, btnToAdTopMin: minY, btnToAdTopMax: maxY, btnHeight } = adAreaInfo[adType];
            const left = Math.trunc((currentScreenWidth - adAreaWidth) / 2);
            const top = Math.trunc((currentScreenHeight - adAreaHeight) / 2);
            minY = adAreaHeight - 221;
            maxY = minY + btnHeight;
            return {
                adAreaWidth,
                adAreaHeight,
                left,
                top,
                minX,
                maxX,
                minY,
                maxY
            }
        },
        back(adInfo) {
            const { adType } = adInfo;
            const { currentScreenWidth, currentScreenHeight, adAreaInfo, isVerticalButton } = _self;
            let { adAreaWidth, adAreaHeight, btnToAdLeftMin: minX, btnToAdLeftMax: maxX, btnToAdTopMin: minY, btnToAdTopMax: maxY } = adAreaInfo[adType];
            // if(isVerticalButton) {
            //     adAreaHeight = 796;
            //     minX = (646 - 502) / 2;
            //     maxX = minX + 502;
            //     minY = 796 - 80 - 32;
            //     maxY = minY + 80;
            // }
            const left = Math.trunc((currentScreenWidth - adAreaWidth) / 2);
            const top = Math.trunc((currentScreenHeight - adAreaHeight) / 2);
            return {
                adAreaWidth,
                adAreaHeight,
                left,
                top,
                minX,
                maxX,
                minY,
                maxY
            }
        }
    }
    /**
        * fnGetCoordinates                            获取广告点击坐标
        * @param {object} adClickCoordinatesArea      点击坐标范围信息
        * @param {object} adInfo                      广告信息
    */
    _self.fnGetCoordinates = function (adClickCoordinatesArea, adInfo) {
        const { adAreaWidth, adAreaHeight, left, top, minX, minY, maxX, maxY } = adClickCoordinatesArea;
        let { clickX, clickY, leaveClickX, leaveClickY, isRealClick } = adInfo;
        const clickxMin = left;
        const clickxMax = left + adAreaWidth;
        const clickyMin = top;
        const clickyMax = top + adAreaHeight;
        const isOverFlowBoundary = clickX > clickxMax || clickX < clickxMin || clickY > clickyMax || clickY < clickyMin || leaveClickX > clickxMax || leaveClickX < clickxMin || leaveClickY > clickyMax || leaveClickY < clickyMin;
        const realClick = clickX && clickY && leaveClickX && leaveClickY && isRealClick;
        clickX -= left
        clickY -= top
        leaveClickX -= left
        leaveClickY -= top
        if (isOverFlowBoundary || !realClick) {
            const adClickOffsetLocalInfo = app.getAppData('adClickOffsetLocalInfo');
            const adClickOffsetConfInfo = app.getAppData('adClickOffsetConfInfo');
            clickX = leaveClickX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
            clickY = leaveClickY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
            if (adClickOffsetLocalInfo) {
                const { offsetX: offsetXLocal, offsetY: offsetYLocal, leaveOffsetX: leaveOffsetXLocal, leaveOffsetY: leaveOffsetYLocal } = adClickOffsetLocalInfo;
                leaveClickX += leaveOffsetXLocal - offsetXLocal;
                leaveClickY += leaveOffsetYLocal - offsetYLocal;
            } else if (adClickOffsetConfInfo) {
                const { noScale, xAxisBegin: minRandomX, xAxisEnd: maxRandomX, yAxisBegin: minRandomY, yAxisEnd: maxRandomY } = adClickOffsetConfInfo;
                const isRandom = Math.random() > (noScale / 100);
                if (isRandom) {
                    let xRandomOffset, yRandomOffset
                    while (!xRandomOffset && !yRandomOffset) {
                        xRandomOffset = Math.floor(Math.random() * (maxRandomX - minRandomX + 1)) + minRandomX;
                        yRandomOffset = Math.floor(Math.random() * (maxRandomY - minRandomY + 1)) + minRandomY;
                    }
                    leaveClickX += xRandomOffset;
                    leaveClickY += yRandomOffset;
                } 
            }
            leaveClickX = leaveClickX < minX ? minX : leaveClickX > maxX ? maxX : leaveClickX; 
            leaveClickY = leaveClickY < minY ? minY : leaveClickY > maxY ? maxY : leaveClickY;
        }
        return {
            clickX,
            clickY,
            leaveClickX,
            leaveClickY
        }      
    }
    /**
        * fnSetCurrentScreenHeight                    获取当前屏幕高度
        * @param {object} deviceSizeInfo              设备宽高
    */
    _self.fnSetCurrentScreenHeight = function (deviceInfo) {
        const { screenWidth, screenHeight } = deviceInfo;
        _self.currentScreenHeight = _self.currentScreenWidth / screenWidth * screenHeight;
    }
    /**
     * fnGetAdMockClickInfo        处理点击区域前置方法
     * @param {object} adInfo      广告信息
    */
    _self.fnGetAdMockClickInfo = function (adInfo) {
        const { deviceInfo, adType } = adInfo;
        if (!_self.currentScreenHeight) {
            _self.fnSetCurrentScreenHeight(deviceInfo);
        }
        const adSizeInfo = _self.adSizeInfo;
        const { adAreaWidth, adAreaHeight, top, left, minX, minY, maxX, maxY } = adSizeInfo[adType] && adSizeInfo[adType](adInfo);
        const { clickX, clickY, leaveClickX, leaveClickY } = _self.fnGetCoordinates({ adAreaWidth, adAreaHeight, top, left, minX, minY, maxX, maxY }, adInfo);
        return {
            width: adAreaWidth,                                             // 广告区域宽度
            height: adAreaHeight,                                           // 广告区域高度
            adX: left,                                                      // 广告区域左上角距屏幕左上角y方向距离
            adY: top,                                                       // 广告区域左上角距屏幕左上角x方向距离
            downX: clickX,                                                  // 按下时X方向坐标
            downY: clickY,                                                  // 按下时y方向坐标
            upX: leaveClickX,                                               // 抬起时x方向坐标
            upY: leaveClickY                                                // 抬起时y方向坐标
        }
    }
}