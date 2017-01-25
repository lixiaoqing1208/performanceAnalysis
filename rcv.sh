#!/usr/bin/bash
. /etc/profile

# 计算前一天的日期期望格式20150505
timestamp=$(date -d '1 days ago' +%Y%m%d)
# 计算前一天一周前的日期，期望格式20150505
timeAWeekAgo=$(date -d '9 days ago' +%Y%m%d)

# 找到那天的数据删除掉（否则数据太多占不下）
# /usr/bin/find /home/users/lixiaoqing01/disk/ -name *$timeAWeekAgo* |xargs rm -rf


# 筛选数据，筛选带有uniqid的
# 默认awk是以空格分割的，第11个应该是浏览的url，如果url匹配'/s/',则认为是中间页，是我们需要统计的，则打印$7给后面处理
# \之后就可以换行了
# 筛选后的数据放到当前目录下的filter
accesslog='/home/users/lixiaoqing01/disk/source/rcv.accesslog.'$timestamp
# if [ ! -f $accesslog ]
# then
# # 插入expect脚本，用scp来copy前一天的log日志放到当前目录下的source
# /home/tools/bin/64/expect <<EOF
# set timeout -1
# spawn /usr/bin/scp -r koubei@nj02-chengxin-dashboard00.nj02.baidu.com:/home/users/koubei/var/womc/rcv/rcv.accesslog.20150717 /home/users/lixiaoqing01/disk/source/
# match_max  1024*1024*1024*10
# expect -exact "password:"
# send "dfrd123\r"
# expect eof
# EOF
# fi
# 如果存在前一天的数据则进行分析和发送分析邮件
if [ -f $accesslog ]
then
    touch /home/users/lixiaoqing01/disk/filter/log.$timestamp
    cat $accesslog | grep "uniqid" | awk '{if($11 ~ /\/s\//){print $7}}'\
    | awk -F'&' '{printf "%s.%s\n", $4,$6}'| awk -F'=' '{printf "%s=%s\n", $2,$3}'\
    | awk '{if ($0 ~/[0-9]$/) {print $0}}' > /home/users/lixiaoqing01/disk/filter/log.$timestamp

    sort /home/users/lixiaoqing01/disk/filter/log.$timestamp > /home/users/lixiaoqing01/disk/sort/log.$timestamp
    # 处理这些数据并输出到result目录下
    ~/.jumbo/bin/node /home/users/lixiaoqing01/disk/src/main.js
    # 发送result目录下的文件到指定邮件
    /usr/bin/mutt -e "my_hdr content-type:text/html" -s "口碑中间页20151218页面性能数据分析" lixiaoqing01@baidu.com, lixiaoqingde123@163.com < /home/users/lixiaoqing01/disk/result/html-$timestamp.html
fi