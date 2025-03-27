import app from '@system.app';
import device from '@system.device';
import sensors from './sensorsdata.min.js';

// 神策参数配置
const shenceConfig = {
	name: 'sensors',
    server_url: 'https://sc-sa.dzfread.cn/sa?project=dzmf_quick' // 新版线上地址
	// server_url: 'https://sc-sa.dzfread.cn/sa?project=default' 旧版线上地址
    // server_url: 'https://sc-sa.dzfread.cn/sa?project=dzmf_quick_test' 新版测试地址
}
sensors.setPara(shenceConfig);

// 神策初始化标识
let hasInitShenceLog = false

// 神策初始化
function fnInit() {
    let _this = this

    if (hasInitShenceLog) {
        return
    }
    hasInitShenceLog = true

    let shenceLog = {
        commonArgs: {}
    }
    
    const appInfo = app.getInfo()
    shenceLog.commonArgs['AppId'] = appInfo.packageName || (_this.$data || '') && _this.$data.pname
    shenceLog.commonArgs['AppName'] = appInfo.name
    shenceLog.commonArgs['AppVersion'] = appInfo.versionCode     

    device.getInfo({
        success: function(ret) {
            shenceLog.commonArgs['PfVersion'] = ret.platformVersionCode
        }
    })

    shenceLog.log = function (that, method, event = '', data = {}) {
        const logData = Object.assign({}, data, this.commonArgs)
        switch (method) {
            case 'appLaunch':
                that.$app.sensors && that.$app.sensors.appLaunch(logData)
                break;
            case 'pageShow':
                that.$app.sensors && that.$app.sensors.pageShow(logData)
                break;
            case 'track':
                if(event) {
                    that.$app.sensors && that.$app.sensors.track(event, logData)
                }
                break;
            default:
                break;
        }
    }

    shenceLog.fnSetCommonArgs = function (args) {
        if (!args) return
        if (Object.prototype.toString.call(args).slice(8, -1) !== 'Object') return
        this.commonArgs = Object.assign({}, this.commonArgs, args)
    }

    _this.shenceLog = shenceLog

    sensors.init(_this);
}

function fnLogout () {
    const firstID = sensors.store.getFirstId();
    if (firstID) {
        sensors.store.set('first_id', '');
        sensors.store.set('distinct_id', firstID);
    }
}

function fnGetDistinctId () {
    const firstID = sensors.store.getFirstId();
    if (firstID) {
        return firstID
    } else {
        return sensors.store.getDistinctId();
    }
}

export default {
    fnInit,
    fnLogout,
    fnGetDistinctId
}