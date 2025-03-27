function fnApiCacheInit () {
    let that = this
    console.log('----------fnApiCacheInit----------')
    that.isApiCache = false
    /**
     * apiCaches {array} API广告缓存
     * adCache {object} 广告信息
     *  createTime {date} 创建时间
     *  adSlotId {string} 广告位ID
     *  agentId {string} 策略ID
     *  adData {object} 广告信息
     *  isUsed {boolean} 使用过
     */
    that.apiCaches = []
    /**
     * fnFindApiAgentIdBySlotId 通过广告位ID查找策略ID
     * @param {string} adSlotId 广告位ID
     * @return {string | boolean} agentId/false
     */
    that.fnFindApiAgentIdBySlotId = function (adSlotId) {
        that.fnUpdateApiCaches()
        console.log('----------fnFindApiAgentIdBySlotId----------')
        if(!adSlotId) {
            return false
        }
        let caches = that.apiCaches
        if (!caches.length) {
            return false
        }
        for (let i = 0; i < caches.length; i++) {
            if (caches[i].adSlotId == adSlotId) {
                return caches[i].agentId + ''
            }
        }
        return false
    }
    /**
     * fnSearchApiCacheBySlotId 通过广告位ID获取广告缓存
     * @param {string} adSlotId 广告位ID
     * @return {object | boolean} adCache/false
     */
    that.fnSearchApiCacheBySlotId = function (adSlotId) {
        that.fnUpdateApiCaches()
        console.log('----------fnSearchApiCacheBySlotId----------')
        if(!adSlotId) {
            return false
        }
        let caches = that.apiCaches
        if (!caches.length) {
            return false
        }
        for (let i = 0; i < caches.length; i++) {
            if (caches[i].adSlotId == adSlotId) {
                return caches[i].adData
            }
        }
        return false
    }
    /**
     * fnChangeApiCacheBySlotId 通过广告位ID改变缓存API状态
     * @param {string} adSlotId 广告位ID
     * @return {boolean} 操纵结果
     */
    that.fnChangeApiCacheBySlotId = function (adSlotId) {
        console.log('----------fnChangeApiCacheBySlotId----------')
        let isChange = false
        let caches = that.apiCaches
        for (let i = 0; i < caches.length; i++) {
            if (caches[i].adSlotId == adSlotId) {
                caches[i].isUsed = true
                isChange = true
                break;
            }
        }
        that.fnUpdateApiCaches()
        return isChange
    }
    /**
     * fnAddApiCache 添加API缓存
     * @param {string} adSlotId 广告位ID
     * @param {object} adData 广告数据
     * @return {boolean} 操纵结果
     */
    that.fnAddApiCache = function (adSlotId, adData) {
        that.fnUpdateApiCaches()
        console.log('----------fnAddApiCache----------')
        if(!adSlotId || !adData || !adData.agent_id) {
            return false
        }
        adData.isLocalCache = true
        let isReplace = false
        let adCache = {
            createTime: new Date().getTime(),
            adSlotId: adSlotId,
            agentId: adData.agent_id, 
            adData: adData,
            isUsed: false
        }
        let caches = that.apiCaches
        for (let i = 0; i < caches.length; i++) {
            if (caches[i].adSlotId == adCache.adSlotId) {
                isReplace = true
                that.apiCaches.splice(i, 1, adCache)
                break;
            }
        }
        if(isReplace) {
            return true
        }
        that.apiCaches.push(adCache)
        return true
    }
    /**
     * fnUpdateApiCaches 更新API缓存
     * @return {boolean} 操纵结果
     */
    that.fnUpdateApiCaches = function () {
        console.log('----------fnUpdateApiCaches----------')
        let needUpdate = false
        let result = []
        let nowTime = new Date().getTime()
        let caches = that.apiCaches
        if (!caches.length) {
            return false
        }
        for (let i = 0; i < caches.length; i++) {
            if (!caches[i].isUsed && caches[i].createTime && nowTime - caches[i].createTime < 30 * 60 * 1000) {
                result.push(caches[i])
                continue;
            }
            needUpdate = true
        }
        if (needUpdate) {
            that.apiCaches = result
            return true
        }
        return false
    }
}
export default fnApiCacheInit