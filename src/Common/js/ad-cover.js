export default function fnAdCover() {
    if (!this || this.name !== 'app') {
        console.error('---广告覆盖初始化方法调用出错，上下文对象应为$app---');
        return false;
    }
    let that = this;
    that.adFullScreenCover = {
        position: null,                                     // 正在展示的位置
        pending: [],                                        // 所有可以展示的位置列表，按priority排序
    }
    /**
     * 广告覆盖列表新增
     * @param   {Object}    position        [可以展示广告覆盖的位置信息]
    */
    that.fnAdFullScreenCoverListAdd = function(position) {
        if (!position) {
            return false;
        }
        let pending = that.adFullScreenCover.pending;
        pending.push(position);
        pending.sort((a, b) => b.priority - a.priority);
        that.adFullScreenCover.position = pending[0].position;
    }

    /**
     * 广告覆盖列表删除
     * @param   {Object}    position        [可以展示广告覆盖的位置信息]
    */
    that.fnAdFullScreenCoverListDelete = function(position) {
        if (!position) {
            return false;
        }
        let pending = that.adFullScreenCover.pending;
        if (pending && pending.length) {
            for (let i = 0; i < pending.length; i++) {
                if(pending[i].position === position.position) {
                    pending.splice(i, 1);
                    that.adFullScreenCover.position = pending.length ? pending[0].position : null;
                    break ;
                }
            }
        }
    }
}