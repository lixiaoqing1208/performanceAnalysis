/**
 * @file 处理数据入口文件
 * @author lixiaoqing(lixiaoqing01@baidu.com)
 */

// 要处理的数据
var filterData;

// 各指标各时间段分段数据
var sectionSplitter = {
    ws: [300, 600, 1000, 1500, 2000, 3000, 4000, 6000],
    fs: [300, 600, 1000, 1500, 2000, 3000, 4000, 6000],
    dr: [1000, 2000, 3000, 4000, 5000, 6000, 10000, 20000, 40000, 60000],
    ol: [1000, 2000, 3000, 4000, 5000, 6000, 10000, 20000, 40000, 60000]
};

// 每个数组里存放对应性能指标区间的数据值的总和
var sectionSum = {ws: [], fs: [], dr: [], ol: []};
// 每个数组里存放对应性能指标区间的数据的总个数
var sectionCount = {ws: [], fs: [], dr: [], ol: []};
// 每个数组里存放对应性能指标区间的数据的平均值
var sectionAvg = {ws: [], fs: [], dr: [], ol: []};


/**
 * 计算各个指标各个时间段内的数量，总值
 *
 */
function countSectionNum() {
    filterData.forEach(function (item) {
        for (var i in item) {
            if (item.hasOwnProperty(i)) {
                var value = item[i];
                var thisSectionSplitter = sectionSplitter[i];
                for (var j in thisSectionSplitter) {
                    var num = thisSectionSplitter[j];
                    if (value > num) {
                        continue;
                    }
                    if (!sectionCount[i][j]) {
                        sectionCount[i][j] = 0;
                    }

                    if (!sectionSum[i][j]) {
                        sectionSum[i][j] = 0;
                    }

                    sectionSum[i][j] += value;
                    sectionCount[i][j]++;
                    break;
                }
            }
        }
    });
}

/**
 * 计算各项数值
 *
 * @param {Array} item 需要计算的数值
 * @param {numer} i 索引
 */
function processData(item, i) {

    var length = filterData.length;

    item.forEach(function (sum, index) {
        var start;
        if (index === 0) {
            start = 0;
        }
        else {
            start = sectionSplitter[i][index - 1];
        }

        sectionAvg[i][index] = {
            // 分段区间300~600
            section: start + '~' + sectionSplitter[i][index],
            // 此分段平均值
            avg: Math.round(sum / sectionCount[i][index]),
            // 占总数量的百分比
            percent: Math.round(sectionCount[i][index] * 1000 / length) / 10 + '%',
            // 此分段数量
            count: sectionCount[i][index]
        }
    });
}

/**
 * 计算各个时间段的各项指标（平均值，采样，百分比，上周同比）
 *
 */
function countSectionfield() {
    for (var i in sectionSum) {
        if (sectionSum.hasOwnProperty(i)) {
            var item = sectionSum[i];
            processData(item, i);
        }
    }
}

/**
 * 计算各个时间段的各项指标（平均值，采样，百分比，上周同比）
 *
 * @param {Array} data 符合条件的数据组
 * @return {Array} 计算后的数据数组
 */
function init(data) {
    if (!data.length) {
        return false;
    }

    filterData = data;
    countSectionNum();
    countSectionfield();

    return sectionAvg;
}

module.exports = init;
