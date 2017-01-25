/**
 * @file 全局对象
 * @author lixiaoqing(lixiaoqing01@baidu.com)
 */

// node里面存在global这个对象，避免相同命名
var globalObj = {};

/**
 * 设置数据
 *
 * @public
 * @return {Object} 全局变量object
 */
function get() {
    return globalObj;
}

/**
 * 设置数据
 *
 * @public
 * @param {Object} obj 设置的数据
 */
function set(obj) {
    for (var j in obj) {
        if (obj.hasOwnProperty(j)) {
            globalObj[j] = obj[j];
        }
    }
}

exports.get = get;
exports.set = set;
