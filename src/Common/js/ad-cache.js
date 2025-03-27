import storage from '@system.storage';

export default function fnAdCacheInit () {
    if (!this || this.name !== 'app') {
        console.error('---广告缓存初始化方法调用出错，上下文对象应为$app---');
        return false;
    }
    let that = this;
    that.notClickAdCache = [];              // 未点击广告缓存池
    that.clickedAdCache = [];               // 已点击广告缓存池
    that.adPreCache = [];                   // 预缓存，配置信息未加载前的广告缓存
    that.adCacheConf = {                    // 广告缓存配置信息
        isLoaded: false,                    // 配置信息是否已经加载过
        cacheSwitch: true,                  // 缓存开关 - 中台侧
        notClickAdCacheMaxCount: 0,         // 未点击广告缓存池的最大个数
        clickedAdCacheMaxCount: 0,          // 已点击广告缓存池的最大个数
        filterRuleStr: [                    // 过滤规则对应广告物料的字段名，和filterRules数组每项的值做映射
            'title',
            'description',
            'icon_url',
            'images',
        ],
        filterRules: [],                    // 过滤规则，广告唯一性标识
        clickTypeOfReplace: [],             // 什么类型的点击进行替换, 0：真实点击，1：误点击
        clickCountOfReplace: 0,             // 点击多少次之后进行替换
    }
    /**
     * 广告预缓存池添加广告
     * @param   {Object}    ad      [广告数据]
    */
    that.fnAddAdToPreCache = ad => {
        that.adPreCache.push(ad);
    }
    /**
     * 广告预缓存池删除广告
     * @param   {Object}    ad      [广告数据]
    */
    that.fnRemovePreCache = ad => {
        let caches = that.adPreCache;
        if (!caches || !caches.length) {
            return false;
        }
        for (let i = 0; i < caches.length; i++) {
            if (ad.custom_id === caches[i].custom_id) {
                caches.splice(i, 1);
                return true;
            }
        }
    }
    /**
     * 清空预缓存池
    */
    that.fnClearPreCache = () => {
        that.adPreCache = [];
    }
    /**
     * 处理缓存配置信息未加载成功前的广告预缓存数据
    */
    that.fnAdPreCacheHandle = () => {
        let caches = that.adPreCache;
        if (!caches || !caches.length) {
            return false;
        }
        for (let i = 0; i < caches.length; i++) {
            that.fnAddAdToNotClickCache(caches[i]);                                     // 将预缓存池的广告添加至未点击缓存池
        }
        that.adPreCache = [];                                                           // 清空预缓存池
    }
    /**
     * 过滤未点击缓存池 - 过滤条件：曝光次数、过期时间
     * @param   {Array}     caches      [缓存列表]
    */
     that.fnNotClickCacheFilter = caches => {
        if (!caches || !caches.length) {
            return [];
        }
        let nowTime = Date.now();
        let filterResult = [];
        for (let i = 0; i < caches.length; i++) {
            let item = caches[i];
            let {
                exposureCount,                                                          // 已曝光次数
                expires,                                                                // 过期时间
            } = item;
            let eo_cache_num = parseInt(item.ext.eo_cache_num);                         // 曝光次数限制
            if (eo_cache_num && exposureCount >= eo_cache_num || nowTime >= expires) {  // 曝光次数超出限制 或 已过期
                that.fnDeleteAdInstances(item);                                         // 删除已过期的广告在页面存储的广告实例
                continue ;
            }
            filterResult.push(item);
        }
        return filterResult;
    }
    /**
     * 过滤已点击缓存池，并更新storage - 过滤条件：过期时间
     * @param   {Boolean}       isUpdateToStorage       [是否更新storage，默认为true]
    */
    that.fnClickedCacheFilter = (isUpdateToStorage = true) => {
        let caches = that.clickedAdCache;                                               // 已点击缓存池
        if (!caches || !caches.length) {
            return caches;
        }
        let nowTime = Date.now();
        let filterResult = [];
        for (let i = 0; i < caches.length; i++) {
            let item = caches[i];
            if (item.expires > nowTime) {
                filterResult.push(item);
                continue ;
            }
        }
        if (caches.length !== filterResult.length) {
            that.clickedAdCache = filterResult;                                         // 更新已点击缓存池
            if (isUpdateToStorage) {
                that.fnUpdateClickedCacheToStorage();                                   // 更新已点击缓存至storage
            }
        }
        return that.clickedAdCache;
    }
    /**
     * 未点击广告缓存池按价格排序，并判断缓存池最大长度
    */
    that.fnSortAndSlice= caches => {
        let maxCount = that.adCacheConf.notClickAdCacheMaxCount;                        // 未点击缓存池的最大条数限制
        caches = caches.sort((a, b) => b.cpm - a.cpm);                                  // 按cpm排序
        if (caches.length > maxCount) {                                                 // 缓存最大个数判断
            that.fnDeleteAdInstances(caches.slice(maxCount - 1));                       // 删除截断的广告在页面存储的广告实例
            caches = caches.slice(0, maxCount);
        }
        return caches;
    }
    /**
     * 从未点击缓存中根据过滤规则查找相同广告
     * @param   {Array}     caches      [缓存列表]
     * @param   {Object}    ad          [要查询的广告]
     * @return  {Number}                [查询到的广告的索引]
    */
    that.fnSearchSameAdFromCaches = (caches, ad) => {
        let { 
            filterRules,                                                                // 过滤规则列表
            filterRuleStr                                                               // 过滤规则列表对应的广告数据中的字段
        } = that.adCacheConf;
        if (!filterRules.length) {
            return -1;
        }
        for (let i = 0; i < caches.length; i++) {
            let cacheAd = caches[i];                                                    // 缓存列表的当前项
            for (let x = 0; x < filterRules.length; x++) {
                let ruleItemStr = filterRuleStr[filterRules[x]];                        // 当前过滤规则对应的广告物料的字段名
                if (!ruleItemStr) {
                    continue ;
                }
                if (ruleItemStr === 'images') {                                         // 如果过滤规则包含图片，则图片列表中只要有一张图片和缓存中的一致，就认为是同一支广告
                    if (ad.images && ad.images.length && cacheAd.images && cacheAd.images.length) {
                        for (let j = 0; j < ad.images.length; j ++) {
                            let adImageItem = ad.images[j];
                            if (!adImageItem || !adImageItem.url) {
                                continue ;
                            }
                            for (let o = 0; o < cacheAd.images.length; o++) {
                                let cacheAdImageItem = cacheAd.images[o];
                                if (!cacheAdImageItem || !cacheAdImageItem.url) {
                                    continue ;
                                }
                                if (adImageItem.url === cacheAdImageItem.url) {
                                    return i;
                                }
                            }
                        }
                    }
                    continue ;
                }
                if (ad[ruleItemStr] && ad[ruleItemStr] === cacheAd[ruleItemStr]) {      // 标题、描述、icon只要有一个相同，则认为是同一支广告
                    return i;
                }
            }
        }
        return -1;
    }
    /**
     * 从未点击广告缓存池中，取出条件匹配的价格最高的一支广告
     * @param   {Number}    scene   [场景值]
     * @param   {String}    type    [类型，'exposure': 曝光，'click'：点击]
     * @param   {Object}    ad      [被替换的广告数据]
     * @return  {Object}            [缓存中的符合条件的广告数据]
    */
    that.fnGetAdFromNotClickCache = (scene, type, ad) => {
        let caches = that.fnNotClickCacheFilter(that.notClickAdCache);                  // 过滤已过期广告
        that.notClickAdCache = caches;                                                  // 更新未点击缓存池
        if (!caches.length || !scene) {
            return false;
        }
        for (let i = 0; i < caches.length; i++) {
            let cacheAd = caches[i];
            if (cacheAd.chn_type !== 'API' && ad.pageName !== cacheAd.pageName) {
                continue ;
            }
            if (ad.custom_id === cacheAd.custom_id) {                                   // 避免被替换的广告，和替换后的广告是同一个，替换就没有意义
                continue ;
            }
            let {
                lastExposureTime,                                                       // 上次曝光间隔
            } = cacheAd;
            let {
                eo_scenes,                                                              // 场景值
                eo_imp_interval,                                                        // 曝光间隔限制
            } = (cacheAd.ext || {});
            if (eo_scenes && eo_scenes.length && eo_scenes.indexOf(scene) === -1) {                             // 条件判断 --- 场景值不匹配
                continue ;
            }
            if (type === 'exposure' && eo_imp_interval && Date.now() - lastExposureTime < eo_imp_interval) {    // 条件判断 --- 曝光间隔不匹配
                continue ;
            }
            return cacheAd;
        }
        return false;
    }
    /**
     * 未点击广告缓存池 - 删除
     * 先根据广告custom_id查找有没有当前广告，如果有，进行删除
     * 反之，删除缓存中素材相同的广告
     * @param   {Object}    ad      [广告信息]
    */
    that.fnRemoveAdFromNotClickCache = ad => {
        let caches = that.notClickAdCache;
        if (!caches.length) {
            return false;
        }
        let sameAdIndex = -1;                                                           // 缓存中相同广告的索引
        for (let i = 0; i < caches.length; i++) {
            let cacheAd = caches[i];
            if (cacheAd.custom_id === ad.custom_id) {
                sameAdIndex = i;
                break ;
            }
        }
        if (sameAdIndex === -1) {
            sameAdIndex = that.fnSearchSameAdFromCaches(caches, ad);                    // 从缓存中查找相同广告
        }
        if (sameAdIndex > -1) {
            that.fnDeleteAdInstances(caches[sameAdIndex]);                              // 删除该广告在页面中存储的广告实例
            caches.splice(sameAdIndex, 1);
        }
    }
    /**
     * 从已点击缓存池中根据过滤规则查找相同广告
     * @param   {Array}     caches      [已点击缓存列表]
     * @param   {Object}    ad          [要查询的广告]
     * @return  {Number}                [查询到的广告的索引]
    */
    that.fnSearchSameAdFromClickedCache = (caches, ad) => {
        let { 
            filterRules,                                                                // 过滤规则列表
            filterRuleStr,                                                              // 过滤规则列表对应的广告数据中的字段
        } = that.adCacheConf;
        if (!filterRules.length) {
            return -1;
        }
        for (let i = 0; i < caches.length; i++) {
            let cacheAd = caches[i];                                                    // 缓存列表的当前项
            for (let x = 0; x < filterRules.length; x++) {
                let ruleItemStr = filterRuleStr[filterRules[x]];                        // 当前过滤规则对应的广告物料的字段名
                if (!ruleItemStr) {
                    continue ;
                }
                if (ruleItemStr === 'images') {                                         // 如果过滤规则包含图片，则图片列表中只要有一张图片和缓存中的一致，就认为是同一支广告
                    if (ad.images && ad.images.length) {
                        for (let j = 0; j < ad.images.length; j ++) {
                            let adImageItem = ad.images[j];
                            if (!adImageItem || !adImageItem.url) {
                                continue ;
                            }
                            if (cacheAd.images.indexOf(adImageItem.url) > -1) {
                                return i;
                            }
                        }
                    }
                    continue ;
                }
                let adValue = ad[ruleItemStr];                                          // 过滤规则对应的广告字段的值
                if (adValue && cacheAd[ruleItemStr].indexOf(adValue) > -1) {            // 标题、描述、icon只要有一个相同，则认为是同一支广告
                    return i;
                }
            }
        }
        return -1;
    }
    /**
     * 更新已点击缓存池
     * @param   {Object}    ad      [广告信息]
    */
    that.fnUpdateClickedCache = ad => {
        let {
            filterRules,                                                                // 过滤规则列表
            filterRuleStr,                                                              // 过滤规则列表对应的广告数据中的字段
            clickedAdCacheMaxCount,                                                     // 已点击缓存池最大长度限制
        } = that.adCacheConf;
        if (!filterRules.length) {                                                      // 如果没有下发匹配规则，不需要往已点击缓存池存储数据
            return false;
        }
        let caches = that.fnClickedCacheFilter(false);                                  // 已点击缓存池 - 过滤掉已经过期的数据
        let sameAdIndex = that.fnSearchSameAdFromClickedCache(caches, ad);              // 已点击缓存中查找相同广告的索引
        let cacheAd = null;
        if (sameAdIndex === -1) {
            cacheAd = {
                clickedCount: 1,                                                        // 点击次数
                expires: Date.now() + 24 * 60 * 60 * 1000,                              // 过期时间，24小时
                title: [],                                                              // 标题列表
                description: [],                                                        // 描述列表
                icon_url: [],                                                           // icon列表
                images: [],                                                             // 图片列表
            }
        } else {
            cacheAd = caches[sameAdIndex];
            cacheAd.clickedCount++;                                                     // 点击次数+1
        }
        for (let x = 0; x < filterRules.length; x++) {
            let ruleItemStr = filterRuleStr[filterRules[x]];                            // 当前过滤规则对应的广告物料的字段名
            if (!ruleItemStr) {
                continue ;
            }
            if (ruleItemStr === 'images') {                                             // 如果过滤规则包含图片，则图片列表中只要有一张图片和缓存中的一致，就认为是同一支广告
                if (ad.images && ad.images.length) {
                    for (let j = 0; j < ad.images.length; j ++) {
                        let adImageItem = ad.images[j];
                        if (!adImageItem || !adImageItem.url) {
                            continue ;
                        }
                        if (cacheAd.images.indexOf(adImageItem.url) === -1) {
                            cacheAd.images.push(adImageItem.url);
                        }
                    }
                }
                continue ;
            }
            let adValue = ad[ruleItemStr];                                              // 过滤规则对应的广告字段的值
            if (adValue && cacheAd[ruleItemStr].indexOf(adValue) === -1) {              // 标题、描述、icon只要有一个相同，则认为是同一支广告
                cacheAd[ruleItemStr].push(adValue);
            }
        }
        if (sameAdIndex === -1) {                                                       // 之前没有过，则为新增
            caches.push(cacheAd);
        }
        if (caches.length > clickedAdCacheMaxCount) {                                   // 已点击缓存池长度超出最大长度限制
            caches = caches.sort((a, b) => b.expires - a.expires);                      // 按过期时间排序
            caches = caches.slice(0, clickedAdCacheMaxCount);                           // 长度截取
        }
        that.clickedAdCache = caches;                                                   // 更新已点击缓存池
    }
    /**
     * 未点击广告缓存池 - 新增
     * @param   {Object}    ad      [广告数据]
    */
    that.fnAddAdToNotClickCache = ad => {
        if (!ad.lastExposureTime) {
            ad.lastExposureTime = Date.now();                                           // 上次曝光时间
        }
        if (!that.adCacheConf.isLoaded) {                                               // 缓存配置未加载时，先存入预缓存池
            that.fnAddAdToPreCache(ad);
            return false;
        }
        if (!that.adCacheConf.cacheSwitch) {                                            // 缓存开关未开启 - 运营后台
            return false;
        }
        let clickedAdCache = that.fnClickedCacheFilter();                               // 过滤掉已点击缓存池中已经过期的广告
        let sameAdIndexInClickedCache = that.fnSearchSameAdFromClickedCache(clickedAdCache, ad);
        if (sameAdIndexInClickedCache > -1) {                                           // 如果当前广告在已点击缓存池中有相同广告，说明该广告点击过，不用加入缓存
            return false;
        }
        ad.exposureCount = 1;                                                           // 曝光次数
        let caches = that.fnNotClickCacheFilter(that.notClickAdCache);                  // 过滤已过期广告
        if (!caches.length) {
            caches.push(ad);
            that.notClickAdCache = caches;                                              // 更新未点击缓存池
            console.log('---成功加入曝光缓存池----', caches);
            return false;
        }
        let sameAdIndex = that.fnSearchSameAdFromCaches(caches, ad);                    // 从缓存中查找相同广告
        console.log('---曝光缓存相同广告的索引---', sameAdIndex);
        if (sameAdIndex === -1) {                                                       // 没有相同广告
            caches.push(ad);
        } else {
            let cacheAd = caches[sameAdIndex];
            if (cacheAd && ad.cpm > cacheAd.cpm) {                                      // 有相同广告，且新添加的广告的cpm比缓存中同一广告的高
                that.fnDeleteAdInstances(cacheAd);                                      // 删除被替换的广告在页面中存储的广告实例
                caches[sameAdIndex] = ad;                                               // 广告替换
            }
        }
        caches = that.fnSortAndSlice(caches);                                           // 按照CPM排序，并且判断缓存数量限制
        that.notClickAdCache = caches;                                                  // 更新未点击缓存池
        console.log('---成功加入曝光缓存池', caches);
    }
    /**
     * 曝光替换
     * @param   {Number}    scene       [场景值]
     * @param   {Object}    ad          [广告信息]
     * @return  {false | Object}        [替换后的广告]
    */
    that.fnGetExposureReplaceAd = (scene, ad) => {
        if (!that.adCacheConf.isLoaded) {                                               // 配置信息未加载
            return false;
        }
        if (!that.adCacheConf.cacheSwitch) {                                            // 缓存开关未开启 - 运营后台
            return false;
        }
        if (!that.notClickAdCache.length) {                                             // 未点击缓存池为空
            return false;
        }
        let replaceAd = that.fnGetAdFromNotClickCache(scene, 'exposure', ad);           // 从未点击缓存池中获取要替换的广告
        if (!replaceAd) {
            return false;
        }
        return {
            ad: replaceAd,
            fnExposure: () => {
                replaceAd.lastExposureTime = Date.now();                                // 更新上次曝光时间
                replaceAd.exposureCount++;                                              // 已曝光次数+1
            }
        }
    }
    /**
     * 点击替换
     * @param   {Number}    scene       [场景值]
     * @param   {Number}    clickType   [点击类型 0：真实点击，1：误点击]
     * @param   {Object}    ad          [广告信息]
     * @return  {false | Object}        [替换后的广告]
    */
    that.fnGetClickReplaceAd = (scene, clickType, ad) => {
        let {
            isLoaded,                                                                   // 配置信息是否已加载
            cacheSwitch,                                                                // 缓存开关 - 中台侧
            filterRules,                                                                // 过滤规则列表
            clickTypeOfReplace,                                                         // 点击类型
            clickCountOfReplace,                                                        // 点击多少次后进行替换
        } = that.adCacheConf;
        if (!isLoaded) {                                                                // 配置信息未加载
            return false;
        }
        if (!cacheSwitch) {                                                             // 缓存开关未开启 - 运营后台
            return false;
        }
        if (!that.notClickAdCache.length) {                                             // 未点击缓存池为空
            return false;
        }
        if (clickTypeOfReplace.indexOf(clickType) === -1) {                             // 条件判断 --- 点击类型不匹配
            return false;
        }
        if (filterRules.length && clickCountOfReplace) {                                // 如果有下发的过滤规则 和 点击次数条件限制，才去匹配已点击缓存池
            let caches = that.fnClickedCacheFilter();                                   // 过滤掉已点击缓存池中已经过期的广告
            let sameAdIndex = that.fnSearchSameAdFromClickedCache(caches, ad);          // 从点击缓存池中查找相同广告
            if (sameAdIndex === -1) {                                                   // 没有在已点击缓存池中找见相同广告，说明该广告没有发生过点击，无需进行点击替换
                return false;
            }
            let result = caches[sameAdIndex];
            if (result.clickedCount < clickCountOfReplace) {                            // 条件判断 --- 点击次数不满足
                return false;
            }
        }
        let replaceAd = that.fnGetAdFromNotClickCache(scene, 'click', ad);              // 从未点击缓存池中获取要替换的广告
        return replaceAd;
    }
    /**
     * 广告点击：1. 删除未点击缓存池对应广告；2. 更新已点击缓存池；
     * @param   {Object}    ad      [广告信息]
    */
    that.fnAdClickHandle = ad => {
        if (!that.adCacheConf.isLoaded) {                                               // 如果缓存配置未加载，则删除预缓存池对应的广告
            if (!ad.isCache) {                                                          // 是否缓存 - 广告侧 , 如果未开启，不会加入预缓存池，无需处理
                return false;
            }
            that.fnRemovePreCache(ad);
            return false;
        }
        if (!that.adCacheConf.cacheSwitch) {                                            // 缓存开关未开启 - 运营后台
            return false;
        }
        that.fnRemoveAdFromNotClickCache(ad);                                           // 删除未点击缓存池中相同广告
        that.fnUpdateClickedCache(ad);                                                  // 更新已点击缓存池对应广告
        that.fnUpdateClickedCacheToStorage();                                           // 更新已点击缓存至storage
    }
    /**
     * 更新已点击缓存至storage
    */
    that.fnUpdateClickedCacheToStorage = () => {
        let caches = JSON.stringify(that.clickedAdCache);
        storage.set({
            key: 'clickedAdCache',
            value: caches,
            success: function () {},
            fail: function () {}
        });
    }
    /**
     * 更新storage中的已点击缓存至app
    */
    that.fnUpdateClickedCacheFromStorage = () => {
        storage.get({
            key: 'clickedAdCache',
            success: function (data) {
                if (data) {
                    try {
                        that.clickedAdCache = JSON.parse(data) || [];
                    } catch (err) {}
                }
            },
            fail: function () {}
        });
    }
    that.fnUpdateClickedCacheFromStorage();                                             // 更新storage中的已点击缓存至app
    /**
     * 删除页面存储的广告实例
     * @param   {Array | Object}    ads     [广告列表 | 广告]
    */
    that.fnDeleteAdInstances = ads => {
        return false;                                                                   // 此方法先return掉，存在问题：假如底部和插页都曝光替换的是返回弹窗的广告，如果底部删除后将实例删除，那么插页点击会失效
        let type = Object.prototype.toString.call(ads).slice(8, -1);
        if (type === 'Array' && ads.length) {
            ads.map(ad => that.fnDeleteAdInstances(ad));
            return false;
        }
        if (type === 'Object') {
            let {
                pageName,
                custom_id,
            } = ads;
            if (!pageName || !custom_id) {
                return false;
            }
            let adInstances = that.adInstances;                                         // app.ux中存储所有页面广告实例的容器
            if (adInstances && adInstances[pageName]) {
                delete adInstances[pageName]['ad_' + custom_id];                        // 删除页面存储的广告实例
            }
        }
    }
    /**
     * 删除该页面缓存的广告
     * @param   {String}    pageName    [$page.name]
    */
    that.fnDeletePageAdCaches = pageName => {
        that.adInstances[pageName] = {}                                                 // 重置页面存储广告实例的容器
        let caches = that.adCacheConf.isLoaded ? that.notClickAdCache : that.adPreCache;// 删除的是预缓存池 还是 曝光缓存池
        if (!caches.length) {
            return false;
        }
        for (let i = 0; i < caches.length; i++) {
            let ad = caches[i];
            if (ad.pageName === pageName && ad.chn_type.indexOf('QAPP_') === 0) {
                let { custom_id } = ad;
                let adInstance = that.adInstances[pageName]['ad_' + custom_id];
                if (adInstance && adInstance.destroy) {
                    adInstance.destroy();
                }
                caches.splice(i, 1);
                i--;
            }
        }
    }
}