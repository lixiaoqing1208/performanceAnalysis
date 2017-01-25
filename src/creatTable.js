/**
 * @file 产生需要的html表格
 * @author lixiaoqing(lixiaoqing01@baidu.com)
 */

var fs = require('fs');
var path = require('path');
var globalObj = require('./globalObj');

var yesterday;
var aWeekAgo;
var aWeekAgoData;

/**
 * 将数据存成一份json
 *
 * @param {Object} average 计算后的各项指标值
 */
function processJson(average) {
    var yesterdayJson = path.resolve(__dirname, '../data/data-' + yesterday + '.json');
    var aWeekAgoJson = path.resolve(__dirname, '../data/data-' + aWeekAgo + '.json');
    // 将昨天的数据写入json
    fs.writeFileSync(yesterdayJson, JSON.stringify(average));
    // 判断七天前的json是否存在
    if (fs.existsSync(aWeekAgoJson)) {
        aWeekAgoData = JSON.parse(fs.readFileSync(aWeekAgoJson));
    }
}

/**
 * 生成表格的body
 *
 * @param {Object} thisItem 数据
 * @param {number} i 索引
 * @param {Array} tr 表格
 */
function createBody(thisItem, i, tr) {
    thisItem.forEach(function (item, index) {
        var line = '<tr>';
        for (var j in item) {
            if (item.hasOwnProperty(j)) {
                line += '<td>' + item[j] + '</td>';
            }
        }
        if (aWeekAgoData) {
            var oldData = aWeekAgoData[i][index].value;
            if (oldData) {
                var rise = Math.round((oldData - item.value) * 100 / item.value);
                line += '<td>' + rise + '%</td></tr>';
            }
        }
        else {
            line += '<td>暂无数值</td></tr>';
        }

        tr.push(line);
    });
}

/**
 * 生成表格
 *
 * @param {Object} average 计算后的各项指标值
 */
function creatTable(average) {
    var resultPath = path.resolve(__dirname, '../index.html');
    var fileContent = fs.readFileSync(resultPath, 'utf8');
    var yesterdayPath = path.resolve(__dirname, '../result/html-' + yesterday + '.html');

    var thisTable = fileContent;
    var name = {
        ws: '白屏时间',
        fs: '首屏时间',
        dr: 'domReady时间',
        ol: 'onload时间'
    };
    for (var i in average) {
        if (average.hasOwnProperty(i)) {
            var tableHead = '<table>\r\n'
                + '<caption>'
                +     name[i]
                + '</caption>\r\n'
                + '<tr>'
                +     '<th>分段</th>'
                +     '<th>平均值</th>'
                +     '<th>百分比</th>'
                +     '<th>采样</th>'
                +     '<th>相对上周同期</th>'
                + '</tr>';

            var tr = [tableHead];

            createBody(average[i], i, tr);

            tr.push('</table>');
            thisTable += tr.join('\r\n');
        }
    }

    thisTable += '\r\n</body>\r\n</html>';
    fs.writeFileSync(yesterdayPath, thisTable);
}

/**
 * 入口函数
 *
 * @param {Object} average 计算后的各项指标值
 */
function init(average) {
    yesterday = globalObj.get().yesterday;
    aWeekAgo = globalObj.get().aWeekAgo;
    processJson(average);
    creatTable(average);
}

module.exports = init;
