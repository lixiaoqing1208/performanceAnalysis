/**
 * @file 处理数据入口文件
 * @author lixiaoqing
 */

var fs = require('fs');
var path = require('path');
var globalObj = require('./globalObj');
var processData = require('./processData');
var creatTable = require('./creatTable');

/**
 * 获取指定天数前的日期格式为YYYYMMDD
 *
 * @param {number} numDayAgo 指定天数
 * @return {string} 需要的日期
 */
function getAppoiintDate(numDayAgo) {
    var date = new Date();
    date.setDate(date.getDate() - numDayAgo);

    var month = date.getMonth() > 8 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
    var day = date.getDate() > 10 ? date.getDate() : '0' + date.getDate();
    
    // 加字符串以避免数字相加
    return date.getFullYear() + '' + month + '' + day;
}

globalObj.set({
    // 获取8天前的日期
    aWeekAgo: getAppoiintDate(8),
    // 获取1天前的日期
    yesterday: getAppoiintDate(1)
});


// 筛选后数据
var filteredData = [];

/**
 * 处理数据
 *
 * @public
 */
function init() {
    // 获取处理后的昨天的数据
    var filePath = path.resolve(__dirname, '../sort/log.' + globalObj.get().yesterday);
    // 采用数据流方式，一次读取一定量的数据,避免读取文件时导致内存溢出
    var readStream = fs.createReadStream(filePath, {encoding: 'utf8'});

    var uniqid = null;
    var obj = {};

    // 当有数据流出时，处理数据
    readStream.on('data', function(chunk) { 
        readStream.pause();

        var lines = chunk.split(/\r\n|\r|\n/);

        // 运行时一个暂存的变量
        lines.forEach(function (line) {
            // 以这条数据为例子: 00c623bfbabe966ff0523e7fd96327c.dr=145040025287
            // 值为00c623bfbabe966ff0523e7fd96327c.dr
            var key = line.split('=')[0];
            // 值为145040025287，时间戳
            var value = line.split('=')[1];
            // 唯一id为00c623bfbabe966ff0523e7fd96327c
            var keyUniqid = key.split('.')[0];
            // 指标类型为dr
            var keyType = key.split('.')[1];

            // 如果id不相同，认为一条数据已经读取完毕或者是第一次进来
            if (uniqid !== keyUniqid) {
                // 读取完毕则去处理此条数据并删除
                if (obj[uniqid]) {
                    filterData(obj[uniqid]);
                    delete obj[uniqid];
                }
                
                uniqid = keyUniqid;
                obj[uniqid] = {};
            }

            obj[uniqid][keyType] = value;
        });

        readStream.resume();
    });

    // 当没有数据时，进行下一步
    readStream.on('end', function() {
        var finalData = processData(filteredData);
        // 产生表格
        creatTable(finalData);
    });
}

/**
 * 筛选符合条件的数据并计算各指标的值
 *
 * @param {Object} obj 数据转换后的Object
 */
function filterData(item) {
    if (item.start && item.ws && item.fs && item.dr && item.ol) {
        var newItem = {};
        for (var j in item) {
            if (j === 'start') {
                continue;
            }

            var timeInterval = parseInt(item[j], 10) - parseInt(item.start, 10);
            // 时间间隔大于60000或者小与0认为是无效数据
            if (timeInterval > 60000 || timeInterval < 0) {
                continue;
            }

            newItem[j] = timeInterval;
        }

        if (newItem.ws && newItem.fs && newItem.dr && newItem.ol) {
            filteredData.push(newItem);
        }
    }
}

init();
