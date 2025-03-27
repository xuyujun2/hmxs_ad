const organization = 'upo2c29YVSvWo4xIy7Kp';
const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCcfL2g46vwnML1pPjDTBIcAIbJjTsQi/fjrm5XbgP/m/LphUo+cq6506bcDxh2cLfVMctjx1NYF7sNiD61g/g4WAHG1//KYUFMJf16Kdrldwx3PZlMeCNSfG29PIKmq7OpC+wYA/FzW4n2jtnFKEJDzm1bQvARlmvN8293ieOwDQIDAQAB';

export default {
    organization,                                           // 组织标识 必填项
    publicKey,                                              // 公钥 必填项
    authConf: {
        roughLocation: false,                               // 粗略设备定位权限 默认为 false
        exactLocation: false,                               // 精确设备定位权限 默认为 false
        phoneStatus: false                                  // 手机状态权限 默认为 false
    },
    apiProtocal: 'https',                                   // 默认为 https
    apiHost:'fp-it.fengkongcloud.com'                       // 默认设置
    // 2.1 业务机房在国内
    // 1) 用户分布：国内（默认设置）
    // apiHost:'fp-it.fengkongcloud.com'
    // 2) 用户分布：全球
    // apiHost:'fp-it-acc.fengkongcloud.com'
    //
    // 2.2 业务机房在欧美
    // 1) 用户分布：欧美
    // apiHost: 'fp-na-it.fengkongcloud.com'
    // 2) 用户分布：全球
    // apiHost: 'fp-na-it-acc.fengkongcloud.com'
    //
    // 2.3 业务机房在东南亚
    // 1) 用户分布：东南亚
    // apiHost:'fp-sa-it.fengkongcloud.com'
    // 2) 用户分布：全球
    // apiHost:'fp-sa-it-acc.fengkongcloud.com'
    //
    // 2.4 私有化特殊配置
    // apiHost: 'xxxxxx'; // 私有化部署的服务域名
}