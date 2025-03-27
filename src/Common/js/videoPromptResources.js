const XSDQ = 'com.dianzhong.mfxsdq01'
const XSYDB = 'com.dianzhong.xsydb'
const DZYD = 'com.dianzhong.dzyd01'
const XSQJ = 'com.dianzhong.mfxsqj01'
const XGXS = 'com.dianzhong.xgmfxs'
const KKXS = 'com.dianzhong.kkxs'
const RMXSDQ = 'com.dianzhong.rmxsdq'
const SSYD = 'com.dianzhong.ssyd'
const SDD = 'com.dianzhong.sdd'
const HMXS = 'com.dianzhong.hmxs'
const resources = {
    // 小说大全
    [XSDQ]:{
        huawei: [
            'https://xsmfdq.kkyd.cn/images/huawei-xsdq-2.png',
            'https://qng.hzage.cn/others/app/guid/huawei-xsdq.mp4'
        ],
        xiaomi: [
            'https://xsmfdq.kkyd.cn/images/xiaomi-xsdq-2.png',
            'https://qng.hzage.cn/others/app/guid/xiaomi-xsdq.mp4'
        ],
        oppo: [
            'https://xsmfdq.kkyd.cn/images/oppo-xsdq-2.png',
            'https://qng.hzage.cn/others/app/guid/oppo-xsdq.mp4'
        ],
        vivo: [
            'https://xsmfdq.kkyd.cn/images/vivo-xsdq-2.png',
            'https://qng.hzage.cn/others/app/guid/vivo-xsdq.mp4'
        ]
    },
    // 小说阅读吧
    [XSYDB]:{
        huawei: [
            'https://xsmfdq.kkyd.cn/images/huawei-xsydb-2.png',
            'https://qng.hzage.cn/others/app/guid/huawei-xsydb.mp4'
        ],
        xiaomi: [
            'https://xsmfdq.kkyd.cn/images/xiaomi-xsydb-2.png',
            'https://qng.hzage.cn/others/app/guid/xiaomi-xsydb.mp4'
        ],
        oppo: [
            'https://xsmfdq.kkyd.cn/images/oppo-xsydb-2.png',
            'https://qng.hzage.cn/others/app/guid/oppo-xsydb.mp4'
        ],
        vivo: [
            'https://xsmfdq.kkyd.cn/images/vivo-xsydb-2.png',
            'https://qng.hzage.cn/others/app/guid/vivo-xsydb.mp4'
        ]
    },
    // 点众阅读
    [DZYD]:{
        huawei: [
            'https://xsmfdq.kkyd.cn/images/huawei-dzyd-2.png',
            'https://qng.hzage.cn/others/app/guid/huawei-dzyd.mp4'
        ],
        xiaomi: [
            'https://xsmfdq.kkyd.cn/images/xiaomi-dzyd-2.png',
            'https://qng.hzage.cn/others/app/guid/xiaomi-dzyd.mp4'
        ],
        oppo: [
            'https://xsmfdq.kkyd.cn/images/oppo-dzyd-2.png',
            'https://qng.hzage.cn/others/app/guid/oppo-dzyd.mp4'
        ],
        vivo: [
            'https://xsmfdq.kkyd.cn/images/vivo-dzyd-2.png',
            'https://qng.hzage.cn/others/app/guid/vivo-dzyd.mp4'
        ]
    },
    // 小说全集
    [XSQJ]:{
        huawei: [
            'https://xsmfdq.kkyd.cn/images/huawei-xsqj-2.png',
            'https://qng.hzage.cn/others/app/guid/huawei-xsqj.mp4'
        ],
        xiaomi: [
            'https://xsmfdq.kkyd.cn/images/xiaomi-xsqj-2.png',
            'https://qng.hzage.cn/others/app/guid/xiaomi-xsqj.mp4'
        ],
        oppo: [
            'https://xsmfdq.kkyd.cn/images/oppo-xsqj-2.png',
            'https://qng.hzage.cn/others/app/guid/oppo-xsqj.mp4'
        ],
        vivo: [
            'https://xsmfdq.kkyd.cn/images/vivo-xsqj-2.png',
            'https://qng.hzage.cn/others/app/guid/vivo-xsqj.mp4'
        ]
    },
    // 西瓜小说
    [XGXS]:{
        huawei: [
            'https://xsmfdq.kkyd.cn/images/huawei-xgxs-2.png',
            'https://qng.hzage.cn/others/app/guid/huawei-xgxs.mp4'
        ],
        xiaomi: [
            'https://xsmfdq.kkyd.cn/images/xiaomi-xgxs-2.png',
            'https://qng.hzage.cn/others/app/guid/xiaomi-xgxs.mp4'
        ],
        oppo: [
            'https://xsmfdq.kkyd.cn/images/oppo-xgxs-2.png',
            'https://qng.hzage.cn/others/app/guid/oppo-xgxs.mp4'
        ],
        vivo: [
            'https://xsmfdq.kkyd.cn/images/vivo-xgxs-2.png',
            'https://qng.hzage.cn/others/app/guid/vivo-xgxs.mp4'
        ]
    },
    // 快看小说
    [KKXS]:{
        huawei: [
            'https://xsmfdq.kkyd.cn/images/huawei-kkxs-2.png',
            'https://qng.hzage.cn/others/app/guid/huawei-kkxs.mp4'
        ],
        xiaomi: [
            'https://xsmfdq.kkyd.cn/images/xiaomi-kkxs-2.png',
            'https://qng.hzage.cn/others/app/guid/xiaomi-kkxs.mp4'
        ],
        oppo: [
            'https://xsmfdq.kkyd.cn/images/oppo-kkxs-2.png',
            'https://qng.hzage.cn/others/app/guid/oppo-kkxs.mp4'
        ],
        vivo: [
            'https://xsmfdq.kkyd.cn/images/vivo-kkxs-2.png',
            'https://qng.hzage.cn/others/app/guid/vivo-kkxs.mp4'
        ]
    },
    // 热门小说大全
    [RMXSDQ]:{
        huawei: [
            'https://xsmfdq.kkyd.cn/images/huawei-rmxsdq-2.png',
            'https://qng.hzage.cn/others/app/guid/huawei-rmxsdq.mp4'
        ],
        xiaomi: [
            'https://xsmfdq.kkyd.cn/images/xiaomi-rmxsdq-2.png',
            'https://qng.hzage.cn/others/app/guid/xiaomi-rmxsdq.mp4'
        ],
        oppo: [
            'https://xsmfdq.kkyd.cn/images/oppo-rmxsdq-2.png',
            'https://qng.hzage.cn/others/app/guid/oppo-rmxsdq.mp4'
        ],
        vivo: [
            'https://xsmfdq.kkyd.cn/images/vivo-rmxsdq-2.png',
            'https://qng.hzage.cn/others/app/guid/vivo-rmxsdq.mp4'
        ]
    },
    // 松鼠阅读
    [SSYD]:{
        huawei: [
            'https://xsmfdq.kkyd.cn/images/huawei-ssyd-2.png',
            'https://qng.hzage.cn/others/app/guid/huawei-ssyd.mp4'
        ],
        xiaomi: [
            'https://xsmfdq.kkyd.cn/images/xiaomi-ssyd-2.png',
            'https://qng.hzage.cn/others/app/guid/xiaomi-ssyd.mp4'
        ],
        oppo: [
            'https://xsmfdq.kkyd.cn/images/oppo-ssyd-2.png',
            'https://qng.hzage.cn/others/app/guid/oppo-ssyd.mp4'
        ],
        vivo: [
            'https://xsmfdq.kkyd.cn/images/vivo-ssyd-2.png',
            'https://qng.hzage.cn/others/app/guid/vivo-ssyd.mp4'
        ]
    },
    // 书多多
    [SDD]:{
        huawei: [
            'https://xsmfdq.kkyd.cn/images/huawei-sdd-2.png',
            'https://qng.hzage.cn/others/app/guid/huawei-sdd.mp4'
        ],
        xiaomi: [
            'https://xsmfdq.kkyd.cn/images/xiaomi-sdd-2.png',
            'https://qng.hzage.cn/others/app/guid/xiaomi-sdd.mp4'
        ],
        oppo: [
            'https://xsmfdq.kkyd.cn/images/oppo-sdd-2.png',
            'https://qng.hzage.cn/others/app/guid/oppo-sdd.mp4'
        ],
        vivo: [
            'https://xsmfdq.kkyd.cn/images/vivo-sdd-2.png',
            'https://qng.hzage.cn/others/app/guid/vivo-sdd.mp4'
        ]
    },
    [HMXS]:{
        huawei: [
            'https://xsmfdq.kkyd.cn/images/huawei-hmxs-2.png',
            'https://qng.hzage.cn/others/app/guid/huawei-hmxs.mp4'
        ],
        xiaomi: [
            'https://xsmfdq.kkyd.cn/images/xiaomi-hmxs-2.png',
            'https://qng.hzage.cn/others/app/guid/xiaomi-hmxs.mp4'
        ],
        oppo: [
            'https://xsmfdq.kkyd.cn/images/oppo-hmxs-2.png',
            'https://qng.hzage.cn/others/app/guid/oppo-hmxs.mp4'
        ],
        vivo: [
            'https://xsmfdq.kkyd.cn/images/vivo-hmxs-2.png',
            'https://qng.hzage.cn/others/app/guid/vivo-hmxs.mp4'
        ]
    }
}

export {
    resources
}